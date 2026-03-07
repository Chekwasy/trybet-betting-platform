"use client";

import React, { useState, useEffect, MouseEvent, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { mainStateReducer } from '@/store/slices/mainslice';
import { StoreState, PlayeD } from '../tools/s_interface';
import { multiply } from '../tools/multiply';
import Cookies from 'js-cookie';

export default function Main() {
  // Redux Hooks
  const dispatch = useDispatch();
  const storeItems: StoreState = useSelector((state) => state) as StoreState;

  // State Management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isBetInputDone, setIsBetInputDone] = useState(false); 
  const [isBettingPanelOpen, setIsBettingPanelOpen] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [potentialWin, setPotentialWin] = useState('');
  const [totalOdds, setTotalOdds] = useState('');
  const [searchI, setSearchI] = useState(''); 
  const [showGuide, setShowGuide] = useState(false);
 // const [selectedGames, setSelectedGames] = useState<PlayeD[]>([]);

  // State for fetched games and dates
  const [games, setGames] = useState([{
    id: '',
    titleCountry: '',
    subtitle: '',
    events: [{
      id: '',
      hometeam: '',
      awayteam: '',
      homeodd: '',
      awayodd: '',
      drawodd: '',
      Esd: '',
    }]
  }]);
  const [dateList, setDateList] = useState([
    { date: '', indent: 0 },
    { date: '', indent: 1 },
    { date: '', indent: 2 },
    { date: '', indent: 3 },
    { date: '', indent: 4 },
    { date: '', indent: 5 },
    { date: '', indent: 6 },
    { date: '', indent: 7 },
  ]);
  const [currentDate, setCurrentDate] = useState(dateList[0].date); 
  const [currentDateIndent, setCurrentDateIndent] = useState(0); 
  const [showDateList, setShowDateList] = useState(false); 

  const handleSearchI = (e: ChangeEvent<HTMLInputElement>) => {
    const nwval = e.target.value;
    setSearchI(nwval);
  }
  const searchTextAndScroll = () => {
    const searchTerm = searchI;

    // 2. Get content area element with null check
    const contentArea = document.getElementById('contentArea');

    // If contentArea is null, we can't proceed.
    if (!contentArea) {
      console.error("Error: 'contentArea' element not found.");
      alert('Content area not available for search.');
      return; // Exit the function
    }

    // 3. Select all elements within the content area
    // querySelectorAll returns a NodeList, which is iterable.
    // No need for optional chaining here as we've already checked contentArea.
    const allElements = contentArea.querySelectorAll('*');
    let foundElement = null;

    // 4. Iterate through all elements to find the search term
    // No need for optional chaining on `element` inside the loop, as `for...of` ensures `element` is a Node.
    for (const element of allElements) {
      // Check if textContent exists before converting to lowercase and including searchTerm.
      // This handles elements that might not have textContent (e.g., img, input without value).
      if (element.textContent && element.textContent.toLowerCase().includes(searchTerm)) {
        foundElement = element;
        break; // Stop at the first match
      }
    }

    // 5. Scroll to the found element or alert if not found
    if (foundElement) {
      foundElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Optional: Add highlighting logic here
    } else {
      alert(`"${searchTerm}" not found on this page.`);
    }
  };

  // Function to load games data from the backend
  const loadGames = useCallback(async () => {
    try {
      const response = await axios.get(`/api/getgames?date=${currentDateIndent}`);
      const { games: fetchedGames, datee: fetchedDates } = response.data;
      setGames(fetchedGames);
      setDateList(fetchedDates);
      setCurrentDate(fetchedDates[currentDateIndent].date);
    } catch (error) {
      setMessage(`Network or server error: ${error}`);
      setIsMessageOpen(true);
    }
  }, [currentDateIndent]);

  // Effect hook to load games when `currentDateIndent` changes
  useEffect(() => {
    loadGames();
  }, [currentDateIndent, loadGames]);

  // Function to calculate total odds and potential winnings
  const calculateOdds = useCallback(async (items: PlayeD[], currentBetAmount: string) => {
    let calculatedOdds = '1';
    if (items.length > 0) {
      items.forEach((item) => {
        const ln1 = item.odd.length;
        const ln2 = calculatedOdds.length;
        calculatedOdds = (ln1 >= ln2) ? multiply(item.odd, calculatedOdds) : multiply(calculatedOdds, item.odd);
      });
      setTotalOdds(calculatedOdds);

      if (currentBetAmount !== '') {
        const potential = (calculatedOdds.length >= currentBetAmount.length)
          ? multiply(calculatedOdds, currentBetAmount)
          : multiply(currentBetAmount, calculatedOdds);
        setPotentialWin(potential);
      } else {
        setPotentialWin('');
      }
    } else {
      setTotalOdds('1'); // Reset odds if no games selected
      setPotentialWin('');
    }
  }, []);

  useEffect(() => {
    calculateOdds(storeItems?.mainSlice.played, betAmount);
  }, [storeItems, betAmount, calculateOdds]);

  // Handles numerical button presses for bet amount input
  const handleBetAmountInput = (button: string) => {
    let newBetAmount = betAmount;

    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(button)) {
      if (newBetAmount === '' && button !== '0') {
        newBetAmount = button;
      } else if (newBetAmount !== '' && !newBetAmount.includes('.')) {
        newBetAmount += button;
      } else if (newBetAmount !== '' && newBetAmount.includes('.')) {
        if (newBetAmount.split('.')[1]?.length < 2) {
          newBetAmount += button;
        }
      }
    } else if (button === '.' && !newBetAmount.includes('.')) {
      newBetAmount += button;
    } else if (button === 'Del') {
      newBetAmount = newBetAmount.slice(0, -1);
    } else if (button === 'Clear') {
      newBetAmount = '';
    } else if (['10', '100', '1000'].includes(button)) {
      newBetAmount = button;
    }

    setBetAmount(newBetAmount);
    // calculateOdds(selectedGames, newBetAmount); // This will be handled by the useEffect
  };

  // Handle overlay click to close message popup
  const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('popup-overlay')) {
      handleCloseMessage();
    }
  };

  // Handle close message popup
  const handleCloseMessage = () => {
    setIsMessageOpen(false);
  };

  // Handles date selection from the list
  const handleDateSelect = (date: string, indent: number) => {
    setCurrentDate(date);
    setCurrentDateIndent(indent);
    setShowDateList(false);
  };

  // Handles navigating to the next date
  const handleNextDate = () => {
    const currentIndex = dateList.findIndex((item) => item.date === currentDate);
    if (currentIndex < dateList.length - 1) {
      setCurrentDate(dateList[currentIndex + 1].date);
      setCurrentDateIndent(dateList[currentIndex + 1].indent);
    }
  };

  // Handles navigating to the previous date
  const handlePreviousDate = () => {
    const currentIndex = dateList.findIndex((item) => item.date === currentDate);
    if (currentIndex > 0) {
      setCurrentDate(dateList[currentIndex - 1].date);
      setCurrentDateIndent(dateList[currentIndex - 1].indent);
    }
  };

  // Helper function to save game selections and button states
  const saveGameSelections = async (playedGames: PlayeD[], buttonStates: { [key: string]: boolean }) => {
    try {
      await axios.post('/api/postsavedgames', {}, {
        headers: {
          'tok': Cookies.get('trybet_tok') || '',
          'Content-Type': 'application/json',
          savedgames: JSON.stringify(playedGames),
          savedbuttons: JSON.stringify(buttonStates),
        },
      });
      console.log("Game selections saved successfully.");
    } catch (error) {
      console.error("Error saving game selections:", error);
    }
  };

  // Handle home, draw, and away odd selection
  const handleSelection = async (match: {
    id: string; hometeam: string; awayteam: string; homeodd: string; awayodd: string; drawodd: string; Esd: string
  }, selectionType: string, oddValue: string, gameID: string, gameCountry: string, gameSubtitle: string) => {
    const currentButtonState = {
      ...storeItems.mainSlice.buttonState,
      [match.hometeam + selectionType]: !storeItems.mainSlice.buttonState[match.hometeam + selectionType]
    };

    const newSelectedGames = [...storeItems.mainSlice.played];
    const existingIndex = newSelectedGames.findIndex((item) => item.id === match.hometeam + selectionType);

    if (existingIndex !== -1) {
      // If selection exists, remove it
      newSelectedGames.splice(existingIndex, 1);
    } else {
      // If selection does not exist, add it
      const newPlayedGame: PlayeD = {
        id: match.hometeam + selectionType,
        gId: gameID,
        gTCountry: gameCountry,
        gSubtitle: gameSubtitle,
        mktT: '1x2',
        mTime: match.Esd,
        hometeam: match.hometeam,
        awayteam: match.awayteam,
        odd: oddValue,
        selection: selectionType,
        mStatus: 'Not Started',
        mResult: 'NR',
        mOutcome: 'Pending',
        mScore: '- : -',
      };
      newSelectedGames.push(newPlayedGame);
    }

    dispatch(mainStateReducer({
      logged: storeItems.mainSlice.logged,
      played: newSelectedGames,
      me: storeItems.mainSlice.me,
      buttonState: currentButtonState
    }));
    saveGameSelections(newSelectedGames, currentButtonState);
  };

  // Handle removing a played game from the sidebar
  const handleRemovePlayedGame = async (gameToRemove: PlayeD) => {
    const currentButtonState = {
      ...storeItems.mainSlice.buttonState,
      [gameToRemove.hometeam + gameToRemove.selection]: !storeItems.mainSlice.buttonState[gameToRemove.hometeam + gameToRemove.selection]
    };

    const newSelectedGames = storeItems.mainSlice.played.filter((item) => item.id !== gameToRemove.id);

    dispatch(mainStateReducer({
      logged: storeItems.mainSlice.logged,
      played: newSelectedGames,
      me: storeItems.mainSlice.me,
      buttonState: currentButtonState
    }));
    saveGameSelections(newSelectedGames, currentButtonState);
  };

  // Handle booking the bet
  const handleBookBet = async () => {
    setIsBettingPanelOpen(!isBettingPanelOpen);
    setIsBetInputDone(false);

    try {
      const dateResponse = await axios.get('/api/getdate');
      const { hour, minute } = dateResponse.data;
      const gameLength = storeItems.mainSlice.played.length;
      let isExpired = false;

      for (let i = 0; i < gameLength; i++) {
        const gameTime = storeItems.mainSlice.played[i].mTime;
        const formattedGameDate = `${gameTime.substring(0, 4)}-${gameTime.substring(4, 6)}-${gameTime.substring(6, 8)}`;
        let foundDateMatch = false;

        for (let j = 0; j < 8; j++) {
          const checkDate = dateList[j].date;
          if (formattedGameDate === checkDate) {
            if (j === 0) {
              const gameHour = parseInt(gameTime.substring(8, 10));
              const gameMinute = parseInt(gameTime.substring(10, 12));
              if (hour > gameHour || (hour === gameHour && minute > gameMinute)) {
                isExpired = true;
                break;
              }
            }
            foundDateMatch = true;
            break;
          }
        }
        if (isExpired || !foundDateMatch) {
          isExpired = true;
          break;
        }
      }

      if (!isExpired) {
        const betResponse = await axios.post('/api/postbet', {}, {
          headers: {
            'tok': Cookies.get('trybet_tok') || '',
            'Content-Type': 'application/json',
            tobet: JSON.stringify(storeItems.mainSlice.played),
            betamt: betAmount,
            potwin: potentialWin,
            odds: totalOdds
          },
        });
        dispatch(mainStateReducer({
          logged: storeItems.mainSlice.logged,
          played: storeItems.mainSlice.played,
          me: betResponse.data.me,
          buttonState: storeItems.mainSlice.buttonState
        }));
        setMessage(betResponse.data.message);
        setIsMessageOpen(true);
      } else {
        setMessage("One or more selected games have expired. Please review your selections.");
        setIsMessageOpen(true);
      }
    } catch (error) {
      setMessage(`Booking failed: ${error}`);
      setIsMessageOpen(true);
    }
  };

  return (
    <div className="relative bg-white rounded-b-lg border-4 border-green-300 mt-16 lg:border-2 lg:w-4/5 mx-auto">
      {/* Header Section */}
      {!showGuide && (
        <div className="absolute top-0 left-0 w-full bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="font-bold text-lg">1 X 2 Matches</h2>
          <div>
            <div className="flex justify-center items-center gap-2">
              <button
                className='cursor-pointer p-1 rounded-full hover:bg-green-600 transition-colors'
                onClick={handlePreviousDate}
                aria-label="Previous Date"
              >
                <Image src="/icons/back.svg" alt="Back" width={24} height={24} />
              </button>
              <div className="relative">
                <button
                  className='cursor-pointer text-base font-semibold px-3 py-1 rounded-md hover:bg-green-600 transition-colors'
                  onClick={() => setShowDateList(!showDateList)}
                  aria-expanded={showDateList}
                >
                  {currentDate}
                </button>
                {showDateList && (
                  <ul className="absolute z-10 bg-white shadow-xl p-3 w-40 text-gray-800 rounded-lg left-1/2 -translate-x-1/2 mt-2">
                    {dateList.map((item) => (
                      <li
                        key={item.date}
                        onClick={() => handleDateSelect(item.date, item.indent)}
                        className="py-2 px-4 bg-green-500 text-white text-center rounded-md hover:bg-green-700 mb-2 cursor-pointer transition-colors last:mb-0"
                      >
                        {item.date}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className='cursor-pointer p-1 rounded-full hover:bg-green-600 transition-colors'
                onClick={handleNextDate}
                aria-label="Next Date"
              >
                <Image src="/icons/front.svg" alt="Next" width={24} height={24} />
              </button>
            </div>
          </div>
          <button
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex cursor-pointer flex-row items-center relative p-1 rounded-full hover:bg-green-600 transition-colors"
          >
            {storeItems.mainSlice.played.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {storeItems.mainSlice.played.length}
              </div>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Content Area - Game Listings */}
      {!showGuide && (
        <div className="bg-white p-4 pt-20">
          <div className="w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 shadow-md rounded-lg">
            <div className="flex flex-grow max-w-lg space-x-3"> 
              <input type="text" id="searchInput" placeholder="Search Match..." value={searchI} onChange={handleSearchI} className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button onClick={searchTextAndScroll} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out">
                Search
              </button>
            </div>
          </div>
          <div id='contentArea' className="grid gap-6">
            {games.length > 0 ? (
              games.map((game, index) => (
                <div key={game.id || index} className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
                  <h3 className="text-lg text-gray-800 font-bold mb-1">{game.subtitle}</h3>
                  <p className="text-gray-600 text-base">{game.titleCountry}</p>
                  <div className="mt-4">
                    {game.events.map((match, idx) => (
                      <div key={match.id || idx} className="flex flex-col items-center mb-4 pb-4 border-b last:border-b-0 border-gray-200">
                        <div className="flex justify-between w-full items-center">
                          <div className="w-1/2 flex flex-col pr-2">
                            <div className="text-sm text-gray-800 font-medium">{match.hometeam}</div>
                            <div className="text-sm text-gray-800 font-medium">{match.awayteam}</div>
                          </div>
                          <div className="w-1/6 text-xs text-center text-gray-500 font-semibold">
                            {`${match.Esd.substring(8, 10)}:${match.Esd.substring(10, 12)}`}
                          </div>
                          <div className="w-2/5 flex justify-around gap-1">
                            <button
                              onClick={() => handleSelection(match, 'home', match.homeodd, game.id, game.titleCountry, game.subtitle)}
                              className={`flex-1 text-white text-sm font-bold p-2 rounded transition-colors ${storeItems.mainSlice.buttonState[match.hometeam + 'home'] ? 'bg-gray-700 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                              {match.homeodd}
                            </button>
                            <button
                              onClick={() => handleSelection(match, 'draw', match.drawodd, game.id, game.titleCountry, game.subtitle)}
                              className={`flex-1 text-white font-bold text-sm p-2 rounded transition-colors ${storeItems.mainSlice.buttonState[match.hometeam + 'draw'] ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                              {match.drawodd}
                            </button>
                            <button
                              onClick={() => handleSelection(match, 'away', match.awayodd, game.id, game.titleCountry, game.subtitle)}
                              className={`flex-1 text-white font-bold text-sm p-2 rounded transition-colors ${storeItems.mainSlice.buttonState[match.hometeam + 'away'] ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                              {match.awayodd}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 text-lg py-10">No games available for this date.</div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar - Bookings */}
      {!showGuide && (
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l-4 border-green-300 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ top: '0px' }}
        >
          <div className="sticky top-0 w-full bg-green-500 text-white p-4 rounded-t-lg flex justify-between items-center z-10">
            <h2 className="font-bold text-xl">My Bet Slip</h2>
            <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-green-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100vh-250px)]">
            {storeItems?.mainSlice.played.length > 0 ? (
              storeItems?.mainSlice.played.map((item) => (
                <div key={item.id} className="bg-gray-50 shadow-md rounded-lg p-3 mb-3 border border-gray-200">
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='text-sm font-semibold text-gray-700 w-2/3'>{item.gSubtitle} ({item.mktT})</h4>
                    <button onClick={() => handleRemovePlayedGame(item)} className='p-1 rounded-full hover:bg-red-100 transition-colors' aria-label={`Remove ${item.hometeam} vs ${item.awayteam}`}>
                      <Image src="/icons/close.svg" alt="Remove selection" width={20} height={20} />
                    </button>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">{item.hometeam} vs {item.awayteam}</h3>
                  <div className='flex justify-between items-center text-sm text-gray-600'>
                    <p>{`${item.mTime.substring(8, 10)}:${item.mTime.substring(10, 12)}`}</p>
                    <p className="font-semibold text-blue-700">{item.selection}</p>
                    <h4 className='font-bold text-lg text-green-700'>{item.odd}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-10">No games added to your bet slip yet.</div>
            )}
          </div>

          {/* Betting Input and Actions */}
          {storeItems?.mainSlice.played.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full bg-gray-100 p-4 rounded-b-lg border-t-2 border-gray-200">
              <div className="w-full flex flex-col text-white max-w-md mx-auto space-y-2 mb-4">
                <div
                  className="w-full h-10 bg-blue-400 rounded-lg flex items-center justify-center font-bold text-lg cursor-pointer transition-colors hover:bg-blue-500"
                  onClick={() => { setIsBettingPanelOpen(!isBettingPanelOpen); setIsBetInputDone(false); }}
                >
                  {`Amount: ${storeItems?.mainSlice?.me?.currency || ''} ${new Intl.NumberFormat().format(parseFloat(betAmount === '' ? '0' : betAmount))}`}
                </div>
                <div className="w-full h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                  {`Total Odds: ${totalOdds}`}
                </div>
                <div className="w-full h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                  {`Potential Win: ${storeItems?.mainSlice?.me?.currency || ''} ${new Intl.NumberFormat().format(parseFloat(potentialWin === '' ? '0' : potentialWin))}`}
                </div>
              </div>

              {isBettingPanelOpen && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {!isBetInputDone && (
                    <>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('1')}>1</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('2')}>2</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('3')}>3</button>
                      <button className="bet-key-btn bg-red-500 hover:bg-red-600" onClick={() => handleBetAmountInput('Del')}>Del</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('4')}>4</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('5')}>5</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('6')}>6</button>
                      <button className="bet-key-btn bg-green-500 hover:bg-green-600" onClick={() => handleBetAmountInput('10')}>+10</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('7')}>7</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('8')}>8</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('9')}>9</button>
                      <button className="bet-key-btn bg-green-500 hover:bg-green-600" onClick={() => handleBetAmountInput('100')}>+100</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('.')}>.</button>
                      <button className="bet-key-btn" onClick={() => handleBetAmountInput('0')}>0</button>
                      <button className="bet-key-btn bg-red-500 hover:bg-red-600" onClick={() => handleBetAmountInput('Clear')}>Clear</button>
                      <button className="bet-key-btn bg-green-500 hover:bg-green-600" onClick={() => handleBetAmountInput('1000')}>+1000</button>
                      <button
                        className="col-span-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                        onClick={() => setIsBetInputDone(true)}
                      >
                        Confirm Amount
                      </button>
                    </>
                  )}

                  {isBetInputDone && (
                    storeItems.mainSlice.logged ? (
                      <button
                        className="col-span-4 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors"
                        onClick={handleBookBet}
                      >
                        Book Bet
                      </button>
                    ) : (
                      <button
                        className="col-span-4 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Login/Signup to Book Bet
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Guide Section */}
      {!showGuide && (
        <div
          className="fixed bottom-4 right-4 cursor-pointer z-40"
          onClick={() => setShowGuide(true)}
        >
          <div className="bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors">
            Guide
          </div>
        </div>
      )}
      {showGuide && (
        <div className="bg-gray-900 bg-opacity-90 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 lg:p-10 w-full max-w-2xl transform scale-95 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">How to Use This Site 📖</h2>
            <hr className="mb-4" />
            <div className="text-base md:text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                <strong>Site Description</strong>: This platform is designed exclusively for virtual betting practice within the 1x2 betting category. It uses virtual money and is not intended for real-money wagering. Users may be eligible for prizes through test betting, with further details to be announced at a later date.
              </p>
              <p>
                <strong>Tips</strong>: Explore our <strong>Two2Win</strong> <strong>Point5</strong> and <strong>Point5Pro</strong> options for opportunities to enhance your investment returns.
              </p>
              <p className="font-bold text-xl text-center mt-6 mb-3">Menu Options Defined</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Close Button</strong>: Closes the current menu dropdown.</li>
                <li><strong>Home</strong>: Navigates the user to the homepage.</li>
                <li><strong>Sign Up</strong>: Directs the user to the account registration page.</li>
                <li><strong>Login</strong>: Directs the user to the account login page.</li>
                <li><strong>Bets</strong>: Displays a comprehensive record of played games, including both open and closed bets.</li>
                <li><strong>Profile</strong>: Directs the user to their personal dashboard.</li>
                <li>
                  <strong>Two2Win</strong>: Provides access to our 2-odds strategy, which offers projected monthly returns of 30%. Users can access this option for a complimentary 30-days trial. Following the trial, a subscription fee of N250 (weekly) or N800 (monthly) applies.
                </li>
                <li>
                  <strong>Point5 and Point5Pro</strong>: Provides access to our 1.5-odds strategy, which offers projected monthly returns of 30% each. Users can access this option for a complimentary 30-day trial. Following the trial, a subscription fee of N250 (weekly) or N800 (monthly) applies. (A single subscription grants access to both the Two2Win, Point5 and Point5Pro categories.)
                </li>
                <li><strong>About</strong>: Directs the user to the About Us page, which outlines our mission and objectives.</li>
                <li><strong>Logout</strong>: Logs the user out of their current session.</li>
                <li><strong>Reload/Reset</strong>: Resets the virtual balance to N10,000 if it falls below this amount.</li>
              </ul>
              <p className="mt-6">
                <strong>Conclusion</strong>: Our <strong>Two2Win</strong> option demonstrates a 100% confidence rate over a two-months period, while our <strong>Point5</strong> and <strong>Point5Pro</strong> option boasts a 90% confidence rate over a 1 month period. We are committed to carefully curating daily game selections for our Two2Win, Point5 and Point5Pro options. We have option to manage user funds to bet on their behalf for only games placed on our categories. We welcome and are open to collaborations with potential investors.
              </p>
            </div>
            <button
              className="mt-8 bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg mx-auto block transition-colors shadow-md"
              onClick={() => setShowGuide(false)}
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Popup Message */}
      {isMessageOpen && (
        <div
          className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleOverlayClick}
        >
          <div className="popup-content bg-gray-200 rounded-lg shadow-xl p-6 w-full max-w-sm transform scale-95 animate-pop-in border border-gray-300">
            <div className="flex justify-end mb-3">
              <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-300 transition-colors" onClick={handleCloseMessage} aria-label="Close message">
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
  );
}