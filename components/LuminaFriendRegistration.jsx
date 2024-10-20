import React, { useState } from "react";

export default function LuminaFriendRegistration() {
  const [friendAddress, setFriendAddress] = useState("");

  const handleFriendAddressChange = (e) => {
    const address = e.target.value;
    console.log("addressaddressaddress", address);
    setFriendAddress(address);
    console.log("friendAddress", friendAddress);
  };

  const handleRegistration = async () => {
    try {
      const response = await fetch("/api/registerFriend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendAddress }),
      });

      if (response.ok) {
        alert("Friend registered successfully");
        console.log("Friend registered successfully");
      } else {
        console.error("Failed to register friend");
      }
    } catch (error) {
      console.error("Error registering friend:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Lumina Friend Registration</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter friend's Ethereum address"
          value={friendAddress}
          onChange={handleFriendAddressChange}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => handleRegistration().catch(console.error)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Register
        </button>
      </div>
    </div>
  );
}
