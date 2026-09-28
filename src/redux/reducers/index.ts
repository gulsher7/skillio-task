import { combineReducers } from '@reduxjs/toolkit';

import home from './homeSlice';
import onboarding from './onboardingSlice';

export default combineReducers({ onboarding, home });
