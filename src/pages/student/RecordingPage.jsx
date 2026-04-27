// ── Recording Page — Audio recorder with visualization ───────────────────────
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import axios from 'axios';
import { studentApi } from '../../lib/api';
import { useT, useLocale } from '../../lib/i18n';
import { useStudentStore } from '../../stores/studentStore';
import { useAgentStore } from '../../stores/agentStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { C } from '../../components/shared/tokens';
import { SURAHS } from '../../data/quranData';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function RecordingPage() {
  const t = useT();
  const locale = useLocale();
  const addRecording = useStudentStore((s) => s.addRecording);
  const notify = useNotificationStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState('');
  const [ayahRange, setAyahRange] = useState('');
  const [waveData, setWaveData] = useState([]);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(null);

  // Generate visualization data during recording
  const visualize = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, C.gold);
        gradient.addColorStop(1, C.g600);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    draw();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // Setup audio analyser
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setAudioUrl(null);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      visualize();
    } catch (err) {
      notify.error(
        locale === 'ar' ? 'خطأ' : 'Error',
        locale === 'ar' ? 'لا يمكن الوصول إلى الميكروفون' : 'Cannot access microphone'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current?.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (isPaused) {
      mediaRecorder.current.resume();
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      visualize();
    } else {
      mediaRecorder.current.pause();
      clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsPaused(!isPaused);
  };

  const user = useAuthStore((s) => s.user);
  const { analyzeRecitation, insights } = useAgentStore();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const submitRecording = async () => {
    if (!selectedSurah) {
      notify.warning(locale === 'ar' ? 'تنبيه' : 'Warning', locale === 'ar' ? 'اختر السورة أولاً' : 'Select a Surah first');
      return;
    }
    if (!audioUrl) return;

    setLoading(true);
    try {
      // 1. Get presigned URL from our Node backend
      const { uploadUrl, s3Key } = await studentApi.getUploadUrl('audio/webm');
      
      // 2. Fetch the recorded blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // 3. Upload DIRECTLY to S3 using the presigned URL
      await axios.put(uploadUrl, blob, {
        headers: { 'Content-Type': 'audio/webm' }
      });

      // 4. Submit metadata to our Node backend
      const surah = SURAHS.find((s) => String(s.id) === selectedSurah);
      const newRec = await addRecording({
        studentId: user._id,
        halaqaId: user.halaqaId, // If the user is in a specific halaqa
        surahId: parseInt(selectedSurah),
        surahName: surah?.name || '',
        ayahRange: ayahRange || '1-10',
        duration,
        s3Key: s3Key, // Store the S3 reference
        status: 'pending'
      });

      // trigger AI Agent Pre-Analysis
      setAiLoading(true);
      await analyzeRecitation(newRec._id, surah?.name || '', ayahRange || '1-10');
      setAiLoading(false);

      notify.success(locale === 'ar' ? 'تم!' : 'Done!', locale === 'ar' ? 'تم إرسال التسجيل وتحليله ذكياً' : 'Recording submitted and analyzed by AI');
      setAudioUrl(null);
      setDuration(0);
      setSelectedSurah('');
      setAyahRange('');
    } catch (err) {
      notify.error('Error', err.message);
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };



  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    return () => { clearInterval(timerRef.current); cancelAnimationFrame(animFrameRef.current); };
  }, []);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'IBM Plex Sans Arabic'", margin: '0 0 0.25rem' }}>
        🎙️ {t.record}
      </h1>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {locale === 'ar' ? 'سجّل تلاوتك وأرسلها للمعلم لمراجعتها' : 'Record your recitation and submit it for teacher review'}
      </p>

      {/* Surah selector */}
      <Card style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              {t.selectSurah}
            </label>
            <select
              value={selectedSurah}
              onChange={(e) => setSelectedSurah(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.6rem',
                border: '1.5px solid var(--border-primary)', background: 'var(--bg-input)',
                fontSize: '0.88rem', fontFamily: 'inherit', color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <option value="">{locale === 'ar' ? 'اختر...' : 'Select...'}</option>
              {SURAHS.map((s) => (
                <option key={s.id} value={s.id}>{locale === 'ar' ? s.name : s.nameEn} ({s.ayahs} {locale === 'ar' ? 'آية' : 'ayahs'})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
              {t.selectAyah}
            </label>
            <input
              placeholder={locale === 'ar' ? 'مثال: 1-10' : 'e.g. 1-10'}
              value={ayahRange}
              onChange={(e) => setAyahRange(e.target.value)}
              style={{
                width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.6rem',
                border: '1.5px solid var(--border-primary)', background: 'var(--bg-input)',
                fontSize: '0.88rem', fontFamily: 'inherit', color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </Card>

      {/* Recorder Area */}
      <Card style={{
        textAlign: 'center', padding: '2rem',
        background: isRecording
          ? `linear-gradient(135deg, ${C.g900}, ${C.g850})`
          : 'var(--bg-card)',
        border: isRecording ? `1px solid ${C.gold}30` : undefined,
        color: isRecording ? '#fff' : undefined,
        transition: 'all 0.4s',
      }}>
        {/* Waveform */}
        <div style={{
          height: '100px', borderRadius: '0.75rem',
          background: isRecording ? 'rgba(255,255,255,0.05)' : 'var(--bg-tertiary)',
          marginBottom: '1.25rem', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isRecording ? (
            <canvas ref={canvasRef} width={600} height={100} style={{ width: '100%', height: '100%' }} />
          ) : audioUrl ? (
            <audio controls src={audioUrl} style={{ width: '90%' }} />
          ) : (
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              {locale === 'ar' ? 'اضغط للبدء ▶' : 'Press to start ▶'}
            </span>
          )}
        </div>

        {/* Timer */}
        <div style={{
          fontSize: '2.5rem', fontWeight: 900, fontFamily: "'IBM Plex Sans Arabic', monospace",
          marginBottom: '1.5rem',
          color: isRecording ? C.gold : 'var(--text-primary)',
        }}>
          {formatTime(duration)}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {!isRecording && !audioUrl && (
            <Button variant="gold" size="lg" onClick={startRecording} icon="🎙️">
              {t.startRecording}
            </Button>
          )}
          {isRecording && (
            <>
              <Button variant="outline" onClick={pauseRecording}>
                {isPaused ? '▶ ' : '⏸ '}{isPaused ? (locale === 'ar' ? 'استئناف' : 'Resume') : t.pauseRecording}
              </Button>
              <Button variant="danger" onClick={stopRecording}>
                ⏹ {t.stopRecording}
              </Button>
            </>
          )}
          {audioUrl && (
            <>
              <Button variant="gold" size="lg" onClick={submitRecording} icon="📤">
                {t.submitRecording}
              </Button>
              <Button variant="outline" onClick={() => { setAudioUrl(null); setDuration(0); }}>
                🔄 {locale === 'ar' ? 'إعادة' : 'Redo'}
              </Button>
            </>
          )}
        </div>

        {/* AI Insights Display */}
        {(aiLoading || insights) && (
          <div style={{
            marginTop: '1.5rem', padding: '1rem', borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.gold}30`,
            textAlign: 'start'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: C.gold, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ✨ {locale === 'ar' ? 'تحليل المساعد الذكي' : 'AI Agent Insights'}
              {aiLoading && <div className="btn-spinner" style={{ width: '12px', height: '12px' }} />}
            </h4>
            {insights ? (
              <ul style={{ margin: 0, paddingInlineStart: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', listStyleType: 'Arabic-Indic' }}>
                {insights.tips.map((tip, i) => <li key={i} style={{ marginBottom: '0.3rem' }}>{tip}</li>)}
              </ul>
            ) : (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                {locale === 'ar' ? 'جاري تحليل تلاوتك...' : 'Analyzing your recitation...'}
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
}
