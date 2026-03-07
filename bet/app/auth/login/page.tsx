"use client";

import {
  useState,
  ChangeEvent,
  FormEvent,
  MouseEvent,
  useCallback,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Lucide icons are great for modern UIs

// Custom type for the allowed characters for better readability
const ALLOWED_CHARS_REGEX = /^[~!@#$%&_{}[\].;<>a-zA-Z0-9]*$/;

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold text-gray-800 text-center mt-4">
          {message}
        </h2>
      </div>
    </div>
  );
};

function LoginPage() {
  // Renamed from 'Page' to 'LoginPage' for clarity
  const router = useRouter();

  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for validation feedback
  const [isEmailValid, setIsEmailValid] = useState(true); // Renamed for clarity
  const [isPasswordValid, setIsPasswordValid] = useState(true); // Renamed for clarity

  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // State for popup message
  const [message, setMessage] = useState(""); // Renamed for clarity
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Renamed for clarity

  // Handler to close the popup message
  const handleClosePopup = useCallback(() => {
    setIsPopupOpen(false);
    setMessage(""); // Clear message when closed
  }, []);

  // Handler for overlay click to close popup
  const handleOverlayClick = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains("popup-overlay")) {
        handleClosePopup();
      }
    },
    [handleClosePopup],
  );

  // General character validation for inputs
  const isValidInputChars = useCallback((str: string): boolean => {
    return str.length <= 50 && ALLOWED_CHARS_REGEX.test(str);
  }, []);

  // Email input change handler
  const handleEmailChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newEmail = e.target.value;
      setEmail(newEmail);
      // Real-time validation for email
      const isValid =
        newEmail.length >= 6 &&
        newEmail.includes("@") &&
        newEmail.includes(".") &&
        isValidInputChars(newEmail);
      setIsEmailValid(isValid);
    },
    [isValidInputChars],
  );

  // Password input change handler
  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newPassword = e.target.value;
      setPassword(newPassword);
      // Real-time validation for password
      const isValid = newPassword.length >= 6 && isValidInputChars(newPassword);
      setIsPasswordValid(isValid);
    },
    [isValidInputChars],
  );

  // Handles form submission
  const handleLoginSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Re-validate just before submission
      const finalEmailValid =
        email.length >= 6 &&
        email.includes("@") &&
        email.includes(".") &&
        isValidInputChars(email);
      const finalPasswordValid =
        password.length >= 6 && isValidInputChars(password);

      setIsEmailValid(finalEmailValid);
      setIsPasswordValid(finalPasswordValid);

      if (!finalEmailValid || !finalPasswordValid) {
        if (!finalEmailValid && !finalPasswordValid) {
          setMessage("Invalid email and password format.");
        } else if (!finalEmailValid) {
          setMessage(
            'Please enter a valid email address (min 6 chars, contains "@" and ".").',
          );
        } else {
          setMessage(
            "Password must be at least 6 characters and contain only allowed symbols.",
          );
        }
        setIsPopupOpen(true);
        return;
      }

      if (email === "" || password === "") {
        setMessage("Please fill in both email and password fields.");
        setIsPopupOpen(true);
        return;
      }

      try {
        const authHeader = btoa(`${email}:${password}`); // Encode credentials
        const response = await axios.post("/api/connect", {
          auth_header: `Basic ${authHeader}`,
        });

        Cookies.set("trybet_tok", response.data.token, {
          expires: 7,
          path: "/",
        });
        setMessage(response.data.message || "Login successful!");
        setIsPopupOpen(true);
        router.push('/');
      } catch (error) {
        // Use a type guard to ensure 'error' is an AxiosError
        if (axios.isAxiosError(error)) {
          // Access the message from the backend response data
          const errorMessage =
            error.response?.data?.message ||
            "An unexpected error occurred. Please try again.";
          setMessage(errorMessage);
          setIsPopupOpen(true);
        } else {
          // Handle non-Axios errors
          const errorMessage =
            "An unexpected error occurred. Please try again.";
          setMessage(errorMessage);
          setIsPopupOpen(true);
        }
      }
    },
    [email, password, router, isValidInputChars],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-4xl font-extrabold text-green-700 mb-6 text-center">
          Welcome Back!
        </h2>

        <p className="text-gray-600 text-sm mb-6 text-center">
          Login to continue your betting journey.
        </p>

        <form onSubmit={handleLoginSubmit} noValidate>
          {" "}
          {/* noValidate prevents browser's default HTML5 validation */}
          <div className="mb-5">
            <label
              className="block text-gray-800 text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200
                ${isEmailValid ? "border-gray-300" : "border-red-500 ring-red-300"}`}
              id="email"
              type="email" // Use type="email" for better mobile keyboard
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
            <span className="block text-gray-500 text-xs mt-1">
              Allowed symbols: ~!@#$%&amp;\_{}\[].;&lt;&gt;
            </span>
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-800 text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className={`w-full text-gray-600 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 pr-10
                  ${isPasswordValid ? "border-gray-300" : "border-red-500 ring-red-300"}`}
                id="password"
                type={showPassword ? "text" : "password"}
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
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isPasswordValid && (
              <p id="password-error" className="text-red-500 text-xs mt-1">
                Password must be at least 6 characters and contain only allowed
                symbols.
              </p>
            )}
          </div>
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300 transform hover:scale-105"
            type="submit"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          {`Don't`} have an account?{" "}
          <Link
            href={"/auth/signup"}
            className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200"
          >
            Sign Up
          </Link>
        </p>
        <p className="text-center text-gray-600 text-sm mt-6">
          Forgot Password ?{" "}
          <Link
            href={"/auth/fpwd"}
            className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200"
          >
            Reset Password
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

export default LoginPage;
