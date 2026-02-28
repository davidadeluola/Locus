import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAttendance } from '../../hooks/useAttendance';
import { getCurrentLocation, formatDistance } from '../../lib/utils/attendanceUtils';

import AttendanceHeader from './components/AttendanceHeader';
import LocationStatus from './components/LocationStatus';
import OtpInput from './components/OtpInput';
import SubmitButton from './components/SubmitButton';
import ResultFeedback from './components/ResultFeedback';

const AttendancePortal = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [result, setResult] = useState(null);

  const inputRefs = useRef([]);
  const { submitAttendance, loading, reset } = useAttendance();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const captureLocation = async () => {
    setGettingLocation(true);
    setLocationError(null);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (err) {
      setLocationError(err.message || 'Failed to get location');
    } finally {
      setGettingLocation(false);
    }
  };

  useEffect(() => { captureLocation(); }, []);

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    if (!location) { await captureLocation(); return; }
    const response = await submitAttendance(otpCode, location);
    setResult(response);
    if (response.success) {
      setTimeout(() => {
        setOtp(['', '', '', '', '', '']);
        reset();
        setResult(null);
        inputRefs.current[0]?.focus();
      }, 3000);
    }
  };

  const isOtpComplete = otp.every((d) => d !== '');

  return (
    <div className="space-y-6">
      <section className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <AttendanceHeader />
        <LocationStatus location={location} locationError={locationError} gettingLocation={gettingLocation} onRetry={captureLocation} />
        <OtpInput otp={otp} inputRefs={inputRefs} onChange={handleOtpChange} onKeyDown={handleKeyDown} onPaste={handlePaste} />
        <SubmitButton onClick={handleSubmit} disabled={!isOtpComplete || !location || loading} loading={loading} />
      </section>

      <AnimatePresence>
        {result && <ResultFeedback result={{ ...result, distance: result.distance !== undefined ? formatDistance(result.distance) : undefined }} />}
      </AnimatePresence>
    </div>
  );
};

export default AttendancePortal;
