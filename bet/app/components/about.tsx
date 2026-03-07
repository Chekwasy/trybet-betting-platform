"use client"
import { useState, useEffect,} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';


export default function About() {
  const [about, setAbout] = useState(
    [
      {
        title: 'Our Mission',
        body: '',
      }
    ]
  );
  useEffect(() => {
    axios.get('/api/getabout', {
      headers: {
        tok: Cookies.get('trybet_tok'),
    }})
    .then((response) => {
      setAbout(response.data.about);
    })
    .catch(error => {
      console.log(error.message);
    });
  }, []);
  return (
    <div className="flex-col w-full justify-center items-center mt-16">
      <div className=" bg-gray-200 mb-3 flex flex-col p-2 md:w-4/5 w-11/12 mx-auto">
        <div className='flex text-center font-bold p-4 font-bold rounded-lg shadow-md bg-blue-500 text-white b-2 border-gray-400 text-xl'>About Us</div>
      </div>
      <div className="bg-gray-200 flex mb-3 flex-col md:w-4/5 w-11/12 mx-auto">
        {about.map((item, index) => (
          <div key={index}>
            <div className='flex p-4 rounded-lg mb-3 shadow-md text-white text-lg bg-gray-500'>{item.title}</div>
            <p className='flex p-4 bg-green-200 rounded-lg text-gray-800 mb-3'>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
    );
}
