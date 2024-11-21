import React from "react";
import { CiCircleCheck } from "react-icons/ci";
import Navbar from "../components/navbar/Navbar";

export default function page() {
  return (
    <body>
      <Navbar initials={"DB"} /> {/* Navbar component with initials prop */}
      <div className="flex flex-col justify-center items-center m-20">
        <h1>Thank you!</h1>
        <p className="text-m">We recieved your registration form.</p>
        <CiCircleCheck size={100} className="m-5" /> {/* Checkmark icon */}
        <p>Look out for an email from us for next steps.</p>
      </div>
    </body>
  );
}
