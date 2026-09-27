import { authenticate, optionalAuth } from './authenticate.js';
import { authorize, isSelf } from './authorize.js';

const protect = authenticate;

export { protect, authenticate, optionalAuth, authorize, isSelf };
export default protect;
