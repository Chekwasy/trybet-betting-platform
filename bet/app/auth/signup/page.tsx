"use client";

import { useState, ChangeEvent, FormEvent, MouseEvent, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { checkpwd } from '../../tools/func';

// A custom Popup component to centralize message display
interface PopupProps {
  message: string;
  onClose: () => void;
  onOverlayClick: (e: MouseEvent) => void;
  isOpen: boolean;
}

const Popup = ({ message, onClose, onOverlayClick, isOpen }: PopupProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onOverlayClick}
    >
      <div className="popup-content bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-95 animate-pop-in border border-gray-300 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
          onClick={onClose}
          aria-label="Close message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-gray-800 text-center mt-4">{message}</h2>
      </div>
    </div>
  );
};


function SignupPage() { // Renamed from 'Page' to 'SignupPage' for clarity
  // State for form inputs
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State for validation feedback
  const [isFirstnameValid, setIsFirstnameValid] = useState(true);
  const [isLastnameValid, setIsLastnameValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  // State for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for popup message
  const [message, setMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handler to close the popup message
  const handleClosePopup = useCallback(() => {
    setIsPopupOpen(false);
    setMessage('');
  }, []);

  // Handler for overlay click to close popup
  const handleOverlayClick = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('popup-overlay')) {
      handleClosePopup();
    }
  }, [handleClosePopup]);

  // General character validation (using the imported checkpwd function)
  const isValidInputChars = useCallback((str: string): boolean => {
    return str.length <= 50 && checkpwd(str);
  }, []);

  // Firstname input change handler
  const handleFirstnameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newFirstname = e.target.value;
    setFirstname(newFirstname);
    const isValid = newFirstname.length >= 3 && isValidInputChars(newFirstname);
    setIsFirstnameValid(isValid);
  }, [isValidInputChars]);

  // Lastname input change handler
  const handleLastnameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newLastname = e.target.value;
    setLastname(newLastname);
    const isValid = newLastname.length >= 3 && isValidInputChars(newLastname);
    setIsLastnameValid(isValid);
  }, [isValidInputChars]);

  // Email input change handler
  const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const isValid = newEmail.length >= 6 && newEmail.includes('@') && newEmail.includes('.') && isValidInputChars(newEmail);
    setIsEmailValid(isValid);
  }, [isValidInputChars]);

  // Password input change handler
  const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const isValid = newPassword.length >= 6 && isValidInputChars(newPassword);
    setIsPasswordValid(isValid);
    // Also re-validate confirm password if password changes
    setIsConfirmPasswordValid(newPassword === confirmPassword || confirmPassword === '');
  }, [isValidInputChars, confirmPassword]);

  // Confirm Password input change handler
  const handleConfirmPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    const isValid = newConfirmPassword.length >= 6 && isValidInputChars(newConfirmPassword) && newConfirmPassword === password;
    setIsConfirmPasswordValid(isValid);
  }, [isValidInputChars, password]);

  // Handles form submission
  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final validation checks before submission
    const finalFirstnameValid = firstname.length >= 3 && isValidInputChars(firstname);
    const finalLastnameValid = lastname.length >= 3 && isValidInputChars(lastname);
    const finalEmailValid = email.length >= 6 && email.includes('@') && email.includes('.') && isValidInputChars(email);
    const finalPasswordValid = password.length >= 6 && isValidInputChars(password);
    const finalConfirmPasswordValid = confirmPassword === password && finalPasswordValid; // Confirms match and format

    setIsFirstnameValid(finalFirstnameValid);
    setIsLastnameValid(finalLastnameValid);
    setIsEmailValid(finalEmailValid);
    setIsPasswordValid(finalPasswordValid);
    setIsConfirmPasswordValid(finalConfirmPasswordValid);

    if (!finalFirstnameValid || !finalLastnameValid || !finalEmailValid || !finalPasswordValid || !finalConfirmPasswordValid) {
      if (!finalFirstnameValid) {
        setMessage('First name must be at least 3 characters and contain only allowed symbols.');
      } else if (!finalLastnameValid) {
        setMessage('Last name must be at least 3 characters and contain only allowed symbols.');
      } else if (!finalEmailValid) {
        setMessage('Please enter a valid email address (min 6 chars, contains "@" and ".").');
      } else if (!finalPasswordValid) {
        setMessage('Password must be at least 6 characters and contain only allowed symbols.');
      } else if (!finalConfirmPasswordValid) {
        setMessage('Confirm password must match password and meet format requirements.');
      }
      setIsPopupOpen(true);
      return;
    }

    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setMessage('Please fill in all required fields.');
      setIsPopupOpen(true);
      return;
    }

    try {
      const authHeader = btoa(`${email}:${password}`); // Encode credentials
      const response = await axios.post('/api/puser', {
        emailpwd: `encoded ${authHeader}`,
        firstname: firstname,
        lastname: lastname,
      });

      setMessage(response.data.message || 'Signup successful! You can now log in.');
      setIsPopupOpen(true);
      setFirstname('');
      setLastname('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // Optionally redirect to login page after successful signup
      // router.push("/auth/login");
    } catch (error) {
      // Use a type guard to ensure 'error' is an AxiosError
      if (axios.isAxiosError(error)) {
        // Access the message from the backend response data
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
        setMessage(errorMessage);
        setIsPopupOpen(true);
      } else {
        // Handle non-Axios errors
        const errorMessage = 'An unexpected error occurred. Please try again.';
        setMessage(errorMessage);
        setIsPopupOpen(true);
      }
    }
  }, [
    firstname, lastname, email, password, confirmPassword,
    isValidInputChars,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-4xl font-extrabold text-green-700 mb-6 text-center">Join TryBet!</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Create your account to start playing.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* First Name Field */}
          <div className="mb-5">
            <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="firstname">
              First Name
            </label>
            <input
              className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200
                ${isFirstnameValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
              id="firstname"
              type="text"
              placeholder="Your First Name"
              name="firstname"
              value={firstname}
              onChange={handleFirstnameChange}
              required
              aria-invalid={!isFirstnameValid}
              aria-describedby="firstname-error"
            />
            {!isFirstnameValid && (
              <p id="firstname-error" className="text-red-500 text-xs mt-1">
                First name must be at least 3 characters and contain only allowed symbols.
              </p>
            )}
          </div>

          {/* Last Name Field */}
          <div className="mb-5">
            <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="lastname">
              Last Name
            </label>
            <input
              className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200
                ${isLastnameValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
              id="lastname"
              type="text"
              placeholder="Your Last Name"
              name="lastname"
              value={lastname}
              onChange={handleLastnameChange}
              required
              aria-invalid={!isLastnameValid}
              aria-describedby="lastname-error"
            />
            {!isLastnameValid && (
              <p id="lastname-error" className="text-red-500 text-xs mt-1">
                Last name must be at least 3 characters and contain only allowed symbols.
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200
                ${isEmailValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
              id="email"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={email}
              onChange={handleEmailChange}
              required
              aria-invalid={!isEmailValid}
              aria-describedby="email-error"
            />
            {!isEmailValid && (
              <p id="email-error" className="text-red-500 text-xs mt-1">
                Please enter a valid email (min 6 chars, includes @ and .).
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-5">
            <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 pr-10
                  ${isPasswordValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                required
                aria-invalid={!isPasswordValid}
                aria-describedby="password-error"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isPasswordValid && (
              <p id="password-error" className="text-red-500 text-xs mt-1">
                Password must be at least 6 characters and contain only allowed symbols.
              </p>
            )}
            <span className="block text-gray-500 text-xs mt-1">
              Allowed symbols for text fields: ~!@#$%&amp;\_{}\[].;&lt;&gt;
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-gray-800 text-sm font-semibold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <input
                className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 pr-10
                  ${isConfirmPasswordValid ? 'border-gray-300' : 'border-red-500 ring-red-300'}`}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                aria-invalid={!isConfirmPasswordValid}
                aria-describedby="confirm-password-error"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isConfirmPasswordValid && (
              <p id="confirm-password-error" className="text-red-500 text-xs mt-1">
                Passwords do not match or do not meet format requirements.
              </p>
            )}
          </div>

          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 transform hover:scale-105"
            type="submit"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{' '}
          <Link href={'/auth/login'} className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200">
            Log In
          </Link>
        </p>
      </div>

      <Popup
        message={message}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onOverlayClick={handleOverlayClick}
      />
    </div>
  );
}

export default SignupPage;