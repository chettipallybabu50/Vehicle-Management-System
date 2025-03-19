
// "use client";

// import React, { useEffect, useState } from "react";
// import Marquee from "react-fast-marquee";

// export default function MovingNote() {
//   const [message, setMessage] = useState("Fetching latest updates...");

//   useEffect(() => {
//     async function fetchMessage() {
//       setTimeout(() => {
//         setMessage("🚀 New Update: Our latest features are now live!");
//       }, 2000);
//     }

//     fetchMessage();
//   }, []);

//   return (
//     <div className="bg-yellow-300 py-2">
//       <Marquee gradient={false} speed={50}>
//         {message}
//       </Marquee>
//     </div>
//   );
// }


"use client";

import React from "react";
import Marquee from "react-fast-marquee";

export default function MovingNote() {
  return (
    <div className="bg-yellow-300 py-2">
      <Marquee gradient={false} speed={50} direction="right">
        <span style={{ color: "red", fontWeight: "bold" }}>
          🚀 New Update: Parking Places Available !
        </span>
      </Marquee>
    </div>
  );
}

