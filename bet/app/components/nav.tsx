"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, ChangeEvent, MouseEvent, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { mainStateReducer } from '@/store/slices/mainslice';
import { StoreState } from '../tools/s_interface';

export default function Nav() {
  const router = useRouter();
  // Redux Hooks
  const dispatch = useDispatch();
  const storeItems: StoreState = useSelector((state) => state) as StoreState;

  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [profilePicKey, setProfilePicKey] = useState(Date.now());

  // Handlers for message popup
  const handleCloseMessage = useCallback(() => {
    setIsMessageOpen(false);
    setMessage(''); // Clear message when closed
  }, []);

  const handleOverlayClick = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('popup-overlay')) {
      handleCloseMessage();
    }
  }, [handleCloseMessage]);

  // Handle user logout
  const handleLogout = useCallback(async () => {
    try {
      const response = await axios.get('/api/disconnect', {
        headers: {
          tok: Cookies.get('trybet_tok') || '',
        }
      });
      dispatch(mainStateReducer({
        logged: false,
        played: storeItems.mainSlice.played,
        me: storeItems.mainSlice.me,
        buttonState: storeItems.mainSlice.buttonState
      }));
      setMessage(response.data.message);
      setIsMessageOpen(true);
    } catch (error) {
      setMessage(`Logout failed: ${error}`);
      setIsMessageOpen(true);
    }
  }, [dispatch, storeItems.mainSlice]);

  // Handle virtual balance reload/reset
  const handleReloadBalance = useCallback(async () => {
    try {
      const response = await axios.get('/api/getreload', {
        headers: {
          tok: Cookies.get('trybet_tok') || '',
        }
      });
      dispatch(mainStateReducer({
        logged: response.data.logged,
        played: storeItems.mainSlice.played,
        me: response.data.me,
        buttonState: storeItems.mainSlice.buttonState
      }));
      setMessage("Your balance has been reloaded!");
      setIsMessageOpen(true);
    } catch (error) {
      setMessage(`Reload failed: ${error}`);
      setIsMessageOpen(true);
    }
  }, [dispatch, storeItems.mainSlice]);
 
  // Initial data fetch on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get('/api/getme', {
          headers: {
            tok: Cookies.get('trybet_tok') || '',
          }
        });

        const savedGamesResponse = await axios.get('/api/getsavedgames', {
          headers: {
            tok: Cookies.get('trybet_tok') || '',
          }
        });

        dispatch(mainStateReducer({
          logged: userResponse.data.logged,
          played: savedGamesResponse.data.savedgames || [],
          me: userResponse.data.me,
          buttonState: savedGamesResponse.data.savedbuttons || {'': false}
        }));
      } catch (error) {
        router.push("/auth/login");
        console.error("Failed to load user or saved game data:", error);
        // Optionally, dispatch a state to reflect a non-logged in status or show an error message
        dispatch(mainStateReducer({
          logged: false,
          played: [], // Clear played games on error
          me: { currency: 'N', accbal: '0' }, // Reset user data
          buttonState: {}
        }));
      }
    };

    fetchUserData();
  }, [dispatch]); // Dependency array includes dispatch as it's a stable function from React-Redux

  // Handle profile image upload
  const handleImageUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const imageFile = event.target.files[0];

    if (!imageFile.type.startsWith('image/')) {
      setMessage("Please select an image file.");
      setIsMessageOpen(true);
      return;
    }

    const name = 'profilepic';
    const tok = Cookies.get('trybet_tok') || '';
    const type = imageFile.type;

    const fileReader = new FileReader();
    fileReader.onloadend = async (e) => { 
      if (!e.target?.result) {
        setMessage("Failed to read image file.");
        setIsMessageOpen(true);
        return;
      }
      const base64EncodedImage = (e.target.result as string).split(',')[1];

      try {
        const response = await axios.post('/api/picpush', {
          image: base64EncodedImage,
          name,
          tok,
          type,
        });
        setMessage(response.data.message || "Profile picture updated successfully!");
        setIsMessageOpen(true);
        setProfilePicKey(Date.now());
      } catch (error) {
        setMessage(`Image upload failed: ${error}`);
        setIsMessageOpen(true);
      }
    };
    fileReader.readAsDataURL(imageFile);
  }, []);

  // Helper component for navigation items to reduce repetition
  const NavItem = ({ href, iconSrc, altText, label, onClick }: { href?: string; iconSrc: string; altText: string; label: string; onClick?: () => void }) => (
    <li>
      {href ? (
        <Link href={href} className="flex items-center group relative p-2 rounded-md transition-colors hover:bg-green-600">
          <Image src={iconSrc} alt={altText} width={24} height={24} className="filter brightness-0 invert group-hover:filter-none mr-1" /> {/* Inverted color */}
          <span className="text-white text-sm font-medium">{label}</span>
          {/* <div className="absolute left-1/2 -translate-x-1/2 bottom-full mt-12 hidden group-hover:block px-3 py-1 bg-gray-800 text-gray-100 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"> */}
            {/* {label}
          </div> */}
        </Link>
      ) : (
        <button onClick={onClick} className="flex items-center group relative p-2 rounded-md transition-colors hover:bg-green-600 w-full text-left">
          <Image src={iconSrc} alt={altText} width={24} height={24} className="filter brightness-0 invert group-hover:filter-none mr-1" />
          <span className="text-white text-sm font-medium">{label}</span>
          {/* <div className="absolute left-1/2 -translate-x-1/2 bottom-full mt-12 hidden group-hover:block px-3 py-1 bg-gray-800 text-gray-100 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {label}
          </div> */}
        </button>
      )}
    </li>
  );

  return (
    <nav className='bg-green-700 py-3 fixed top-0 left-0 w-full z-50 shadow-lg'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        {/* Logo/Site Title */}
        <Link href={'/'} className='flex items-center'>
          <span className='text-xl md:text-2xl font-extrabold text-white tracking-wider'>TryBet</span>
        </Link>

        {/* Mobile Balance & Reload (Hidden on desktop) */}
        <div className='flex items-center space-x-3 md:hidden'>
          {storeItems.mainSlice.logged && (
            <div className="font-bold text-white text-base">
              {`${storeItems.mainSlice.me.currency || ''} ${new Intl.NumberFormat().format(parseFloat(storeItems.mainSlice.me.accbal || '0'))}`}
            </div>
          )}
          {storeItems.mainSlice.logged && (
            <button
              className="p-1 rounded-full item-center hover:bg-green-600 transition-colors"
              onClick={handleReloadBalance}
              aria-label="Reload virtual balance"
            >
              <Image src="/icons/reload.svg" alt="Reload" width={28} height={28} className="filter brightness-0 invert" />
            </button>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <ul className='hidden md:flex items-center space-x-2 lg:space-x-4'>
          {/* Profile Picture Upload */}
          {/* {storeItems.mainSlice.logged && (
            <li>
              <button
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white hover:border-green-300 transition-colors flex-shrink-0"
                aria-label="Upload profile picture"
              >
                <Image
                  src="/api/getpic"
                  alt="Profile Picture"
                  width={40}
                  height={40}
                  objectFit="cover"
                  className="rounded-full"
                  key={profilePicKey} // Key to force re-render
                />
              </button>
              <input
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </li>
          )} */}

          {/* Account Balance (Desktop only) */}
          {storeItems.mainSlice.logged && (
            <li>
              <div className='bg-green-800 rounded-lg ml-2 text-white text-xxs p-2 font-bold flex items-center justify-center'> {/* Added flex, items-center, justify-center */}
                <div>{storeItems?.mainSlice.me.currency + ' '}</div>
                <div>{(new Intl.NumberFormat().format(parseFloat(storeItems.mainSlice.me.accbal || '0'))).toString()}</div>
              </div>
            </li>
          )}

          {/* Reload Button (Desktop only) */}
          {storeItems.mainSlice.logged && (
            <NavItem
              iconSrc="/icons/reload.svg"
              altText="Reload"
              label="Reload"
              onClick={handleReloadBalance}
            />
          )}

          <NavItem href="/" iconSrc="/icons/home.svg" altText="Home" label="Home" />
          {storeItems.mainSlice.logged ? (
            <>
              <NavItem href="/bets" iconSrc="/icons/games.svg" altText="Bets" label="Bets" />
              <NavItem href="/profile" iconSrc="/icons/profile.svg" altText="Profile" label="Profile" />
              <NavItem href="/two2win" iconSrc="/icons/2odds.svg" altText="Two2Win" label="Two2Win" />
              <NavItem href="/point5" iconSrc="/icons/three2win.svg" altText="Point5" label="Point5" />
              <NavItem href="/point5pro" iconSrc="/icons/threepro.svg" altText="Point5Pro" label="Point5Pro" />
              <NavItem href="/sub" iconSrc="/icons/billing.svg" altText="Billing" label="Billing" />
              <NavItem href="/about" iconSrc="/icons/about.svg" altText="About" label="About" />
              <NavItem iconSrc="/icons/logout.svg" altText="Logout" label="Logout" onClick={handleLogout} />
            </>
          ) : (
            <>
              <NavItem href="/auth/signup" iconSrc="/icons/signup.svg" altText="Signup" label="Signup" />
              <NavItem href="/auth/login" iconSrc="/icons/login.svg" altText="Login" label="Login" />
              <NavItem href="/about" iconSrc="/icons/about.svg" altText="About" label="About" />
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className='md:hidden text-gray-200 p-2 rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <Image
            src={isMenuOpen ? "/icons/close.svg" : "/icons/menu.svg"}
            alt={isMenuOpen ? "Close menu" : "Open menu"}
            width={28}
            height={28}
            className="filter brightness-0 invert"
          />
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>
        )}

        {/* Mobile Navigation Menu */}
        <ul
          className={`md:hidden fixed top-0 right-0 h-full w-64 bg-green-800 shadow-xl p-6 transform transition-transform duration-300 ease-in-out z-50
            ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-6 border-b border-green-700 pb-4">
            <span className="text-xl font-bold text-white">Menu</span>
            <button
              className="text-white p-1 rounded-full hover:bg-green-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close mobile menu"
            >
              <Image src="/icons/close.svg" alt="Close" width={24} height={24} className="filter brightness-0 invert" />
            </button>
          </div>
          <li className="mb-4">
            <button
              onClick={() => document.getElementById('image-upload')?.click()}
              className="w-16 h-16 rounded-full overflow-hidden border-2 border-white mx-auto block hover:border-green-300 transition-colors mb-2"
              aria-label="Upload profile picture"
            >
              <Image
                src="/api/getpic"
                alt="Profile Picture"
                width={64}
                height={64}
                objectFit="cover"
                className="rounded-full"
                key={profilePicKey + '_mobile'}
              />
            </button>
            <input
              id="image-upload"
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </li>
          <li className="mb-6 text-center">
            {storeItems?.mainSlice.logged ? (
              <div className="text-white font-bold text-lg">
                {`${storeItems?.mainSlice.me.currency || ''} ${new Intl.NumberFormat().format(parseFloat(storeItems?.mainSlice.me.accbal || '0'))}`}
              </div>
            ) : (
              <span className="text-gray-300 text-sm">Not Logged In</span>
            )}
          </li>

          <ul className="space-y-3">
            <MobileNavItem href="/" iconSrc="/icons/home.svg" altText="Home" label="Home" onClick={() => setIsMenuOpen(false)} />
            {storeItems.mainSlice.logged ? (
              <>
                <MobileNavItem href="/bets" iconSrc="/icons/games.svg" altText="Bets" label="Bets" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/profile" iconSrc="/icons/profile.svg" altText="Profile" label="Profile" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/two2win" iconSrc="/icons/2odds.svg" altText="Two2Win" label="Two2Win" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/point5" iconSrc="/icons/three2win.svg" altText="Point5" label="Point5" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/point5pro" iconSrc="/icons/threepro.svg" altText="Point5Pro" label="Point5Pro" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/sub" iconSrc="/icons/billing.svg" altText="Billing" label="Billing" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/about" iconSrc="/icons/about.svg" altText="About" label="About" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem iconSrc="/icons/logout.svg" altText="Logout" label="Logout" onClick={() => { handleLogout(); setIsMenuOpen(false); }} />
              </>
            ) : (
              <>
                <MobileNavItem href="/auth/signup" iconSrc="/icons/signup.svg" altText="Signup" label="Signup" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/auth/login" iconSrc="/icons/login.svg" altText="Login" label="Login" onClick={() => setIsMenuOpen(false)} />
                <MobileNavItem href="/about" iconSrc="/icons/about.svg" altText="About" label="About" onClick={() => setIsMenuOpen(false)} />
              </>
            )}
          </ul>
        </ul>

        {/* Popup Message */}
        {isMessageOpen && (
          <div
            className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleOverlayClick}
          >
            <div className="popup-content bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-95 animate-pop-in border border-gray-300">
              <div className="flex justify-end mb-3">
                <button
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={handleCloseMessage}
                  aria-label="Close message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="text-lg font-bold text-gray-800 text-center">{message}</h2>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Helper component for mobile navigation items
const MobileNavItem = ({ href, iconSrc, altText, label, onClick }: { href?: string; iconSrc: string; altText: string; label: string; onClick: () => void }) => (
  <li>
    {href ? (
      <Link href={href} onClick={onClick} className="flex items-center p-3 rounded-md transition-colors hover:bg-green-700">
        <Image src={iconSrc} alt={altText} width={24} height={24} className="filter brightness-0 invert mr-3" />
        <span className="text-white text-base font-medium">{label}</span>
      </Link>
    ) : (
      <button onClick={onClick} className="flex items-center p-3 rounded-md transition-colors hover:bg-green-700 w-full text-left">
        <Image src={iconSrc} alt={altText} width={24} height={24} className="filter brightness-0 invert mr-3" />
        <span className="text-white text-base font-medium">{label}</span>
      </button>
    )}
  </li>
);