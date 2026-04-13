"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useState,
  useEffect,
  ChangeEvent,
  MouseEvent,
  useCallback,
} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { mainStateReducer } from "@/store/slices/mainslice";
import { StoreState } from "../tools/s_interface";

export default function Nav() {
  const router = useRouter();
  const dispatch = useDispatch();
  const storeItems: StoreState = useSelector((state) => state) as StoreState;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const handleCloseMessage = () => {
    setIsMessageOpen(false);
    setMessage("");
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("popup-overlay")) {
      handleCloseMessage();
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get("/api/disconnect", {
        headers: { tok: Cookies.get("trybet_tok") || "" },
      });

      dispatch(
        mainStateReducer({
          logged: false,
          played: [],
          me: {},
          buttonState: {},
        }),
      );
      setMessage(res.data.message);
      setIsMessageOpen(true);
    } catch {
      setMessage("Logout failed");
      setIsMessageOpen(true);
    }
  };

  const handleReloadBalance = async () => {
    try {
      const res = await axios.get("/api/getreload", {
        headers: { tok: Cookies.get("trybet_tok") || "" },
      });

      dispatch(
        mainStateReducer({
          logged: res.data.logged,
          played: storeItems.mainSlice.played,
          me: res.data.me,
          buttonState: storeItems.mainSlice.buttonState,
        }),
      );

      setMessage("Balance reloaded!");
      setIsMessageOpen(true);
    } catch {
      setMessage("Reload failed");
      setIsMessageOpen(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await axios.get("/api/getme", {
          headers: { tok: Cookies.get("trybet_tok") || "" },
        });

        dispatch(
          mainStateReducer({
            logged: user.data.logged,
            played: [],
            me: user.data.me,
            buttonState: {},
          }),
        );
      } catch {
        router.push("/auth/login");
      }
    };

    fetchData();
  }, []);

  return (
    <nav className="bg-green-700 fixed top-0 w-full z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
        {/* LOGO */}
        <Link href="/" className="text-white font-bold text-xl">
          TryBet
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/"
            className="text-white hover:bg-green-600 px-3 py-2 rounded"
          >
            Home
          </Link>

          {storeItems.mainSlice.logged && (
            <Link
              href="/bets"
              className="text-white hover:bg-green-600 px-3 py-2 rounded"
            >
              Bets
            </Link>
          )}

          {/* MORE */}
          <div className="relative group">
            <button className="text-white px-3 py-2 rounded hover:bg-green-600">
              More ▾
            </button>

            <div className="absolute right-0 top-full w-48 bg-white rounded shadow-lg hidden group-hover:block">
              {storeItems.mainSlice.logged && (
                <>
                  <DropdownItem href="/two2win" label="Two2Win" />
                  <DropdownItem href="/point5" label="Point5" />
                  <DropdownItem href="/point5pro" label="Point5Pro" />
                  <DropdownItem href="/sub" label="Billing" />
                  <DropdownItem href="/profile" label="Profile" />
                </>
              )}

              <DropdownItem href="/about" label="About" />
            </div>
          </div>

          {/* BALANCE */}
          {storeItems.mainSlice.logged && (
            <div className="bg-green-800 px-3 py-1 rounded text-white text-sm font-bold">
              {storeItems.mainSlice.me.currency}{" "}
              {new Intl.NumberFormat().format(
                parseFloat(storeItems.mainSlice.me.accbal || "0"),
              )}
            </div>
          )}

          {/* PROFILE MENU */}
          {storeItems.mainSlice.logged ? (
            <div className="relative group">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-green-700 font-bold cursor-pointer">
                U
              </div>

              <div className="absolute right-0 top-full w-40 bg-white rounded shadow hidden group-hover:block">
                <button
                  onClick={handleReloadBalance}
                  className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  Reload
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-white">
                Login
              </Link>
              <Link href="/auth/signup" className="text-white">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          ☰
        </button>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-green-800 text-white p-6 space-y-6 md:hidden">
            <MobileItem href="/" label="Home" />
            {storeItems.mainSlice.logged && (
              <>
                <MobileItem href="/bets" label="Bets" />
                <MobileItem href="/two2win" label="Two2Win" />
                <MobileItem href="/point5" label="Point5" />
                <MobileItem href="/point5pro" label="Point5Pro" />
                <MobileItem href="/sub" label="Billing" />
                <MobileItem href="/profile" label="Profile" />
              </>
            )}

            <MobileItem href="/about" label="About" />

            {storeItems.mainSlice.logged ? (
              <>
                <button onClick={handleReloadBalance}>Reload Balance</button>
                <button onClick={handleLogout} className="text-red-300">
                  Logout
                </button>
              </>
            ) : (
              <>
                <MobileItem href="/auth/login" label="Login" />
                <MobileItem href="/auth/signup" label="Signup" />
              </>
            )}
          </div>
        )}

        {/* MESSAGE MODAL */}
        {isMessageOpen && (
          <div
            className="popup-overlay fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={handleOverlayClick}
          >
            <div className="bg-white p-6 rounded-lg">
              <p>{message}</p>
              <button
                onClick={handleCloseMessage}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

const DropdownItem = ({ href, label }: any) => (
  <Link href={href} className="block px-4 py-2 hover:bg-gray-100">
    {label}
  </Link>
);

const MobileItem = ({ href, label }: any) => (
  <Link href={href} className="block py-2 border-b border-green-700">
    {label}
  </Link>
);
