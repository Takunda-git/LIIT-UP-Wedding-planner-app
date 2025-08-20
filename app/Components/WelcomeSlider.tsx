'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Link from 'next/link';



const WelcomeSlider = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-pink-100 py-10 px-4">
 
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000 }} 
        loop={true}
        pagination={{ clickable: true }}
        slidesPerView={1}
        className="w-full max-w-md"
      >
  
        <SwiperSlide>
          <div className="flex flex-col items-center text-center">
            <img
              src="/welcome.jpeg"
              alt="Couple"
              className="w-70 h-70 object-cover rounded-full mb-6"
            />
            <h3 className="text-1xl font-semibold text-black">Welcome to LIIT UP Wedding Planner 💍</h3>
            <p className='text-sm text-gray-600 p-10'>Enjoy all stages of wedding preparation: make a guest list, keep tracks of tasks, control expenses...</p>
          </div>
        </SwiperSlide>

          <SwiperSlide>
          <div className="flex flex-col items-center text-center">
            <img
              src="/guest list.jpg"
              alt="Couple"
              className="w-70 h-70 object-cover rounded-full mb-6"
            />
            <h3 className="text-xl font-semibold text-black">Make a guest list</h3>
            <p className='text-sm text-gray-600 p-10'>Add guests and companions, make a seating plan, track RSVPs for all your wedding events</p>
          </div>
        </SwiperSlide>

         <SwiperSlide>
          <div className="flex flex-col items-center text-center">
            <img
              src="/tasks.jpg"
              alt="Couple"
              className="w-70 h-70 object-cover rounded-full mb-6"
            />
            <h3 className="text-xl font-semibold text-black">Keep track of tasks</h3>
            <p className='text-sm text-gray-600 p-10'>Add tasks and subtasks, create a personal wedding plan and keep track of upcoming events</p>
          </div>
        </SwiperSlide>

          <SwiperSlide>
          <div className="flex flex-col items-center text-center">
            <img
              src="/budget.jpg"
              alt="Couple"
              className="w-70 h-70 object-cover rounded-full mb-6"
            />
            <h3 className="text-xl font-semibold text-black">Control expenses</h3>
            <p className='text-sm text-gray-600 p-10'>Add expenses and payments, create a wedding budget, manage vendors and save money</p>
          </div>
        </SwiperSlide>

          <SwiperSlide>
          <div className="flex flex-col items-center text-center">
            <img
              src="/plan the wedding together.jpg"
              alt="Couple"
              className="w-70 h-70 object-cover rounded-full mb-6"
            />
            <h3 className="text-xl font-semibold text-black">Plan the wedding together</h3>
            <p className='text-sm text-gray-600 p-10'>Sync all data across devices and plan your wedding with future spouse, family and friends</p>
          </div>
        </SwiperSlide>
      </Swiper>

      <div className="mt-10 flex flex-col items-center">
        <a href='../signup' className="bg-red-400 text-white px-6 py-2 rounded-full text-lg hover:bg-gradient-to-br from-pink-400 to-blue-400">
          Get Started {'>>>'}
        </a>

       <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="../login" className="underline underline-offset-4 text-blue-700">
                Login
              </Link>
            </div>
       
      </div>
      
    </div>
  );
};

export default WelcomeSlider;





