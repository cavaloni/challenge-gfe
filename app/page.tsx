"use client";
import React, { ChangeEvent, FormEvent } from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import useDebounce from "./util/debounce";
import Price from "./components/price";

const Home = () => {
  const currencyList = ["USD", "EUR", "GBP", "CNY", "JPY"];

  const [currentWUCPrice, updateCurrentWUCPrice] = useState(0);
  const [priceDifference, updatePriceDifference] = useState(0);
  const [priceDifferenceDirection, updatePriceDifferenceDirection] =
    useState(false);
  const [fetching, updateFetching] = useState(false);
  const [currency, updateCurrency] = useState(currencyList[0]);
  const [amount, updateAmount] = useState("");
  const [totalAmount, updateTotalAmount] = useState(0);
  const [refreshNeeded, updateRefreshNeeded] = useState(false);
  const debouncedInputVal = useDebounce(amount, 500);

  const intervalFetcher = useRef();

  const getCurrentVal = async (
    currentCurrency: string,
    currentAmount: string
  ) => {
    // prevent race conditions with fetching boolean
    updateFetching(true);
    const url = `https://api.frontendeval.com/fake/crypto/${currentCurrency.toLowerCase()}`;
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      console.log(e);
    }
    if (res) {
      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.log(e);
      }
      const newWUCPrice = data.value;
      const totalVal = Number(currentAmount) * newWUCPrice;
      updateTotalAmount(totalVal);
      const differenceFromPreviousPrice = newWUCPrice - currentWUCPrice;
      const direction = newWUCPrice < currentWUCPrice;
      updatePriceDifference(currentWUCPrice);
      updatePriceDifferenceDirection(direction);
      updateCurrentWUCPrice(newWUCPrice);
      updateFetching(false);
      updateRefreshNeeded(false);
    }
  };

  const setIntervalFetcher = (
    currentCurrency: string,
    currentAmount: string
  ) => {
    if (intervalFetcher.current) {
      clearInterval(intervalFetcher.current);
    }

    if (!fetching && currency) {
      try {
        getCurrentVal(currentCurrency, currentAmount);
      } catch (e) {
        console.log(e);
      }
      intervalFetcher.current = setInterval(() => {
        if (!fetching) {
          updateRefreshNeeded(true);
        }
      }, 5000);
    }
  };

  useEffect(() => {
    if (debouncedInputVal) {
      setIntervalFetcher(currency, debouncedInputVal);
    } else if (intervalFetcher.current && !debouncedInputVal) {
      // cleanup if input is empty
      clearInterval(intervalFetcher.current);
    }
  }, [debouncedInputVal]);

  useEffect(() => {
    // This is needed to avoid stale date from the closure in the setInterval above
    if (refreshNeeded) {
      getCurrentVal(currency, amount);
    }
  }, [refreshNeeded]);

  const handleCurrencyChange = ({
    target: { value },
  }: ChangeEvent<HTMLSelectElement>) => {
    updateCurrency(value);
    setIntervalFetcher(value, amount);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newAmount = e.target.value;
    if (
      newAmount.length > 1 &&
      newAmount.startsWith("0") &&
      !newAmount.startsWith("0.")
    ) {
      newAmount = newAmount.slice(1);
    }
    updateAmount(newAmount);
  };

  return (
    <div className="app">
      <div className="user-inputs">
        <input
          value={amount}
          type={"number"}
          onChange={(e) => handleAmountChange(e)}
        />
        <select value={currency} onChange={(e) => handleCurrencyChange(e)}>
          {currencyList.map((cur) => (
            <option value={cur} key={cur}>
              {cur}
            </option>
          ))}
        </select>
      </div>
      <Price
        totalAmount={totalAmount}
        priceDifferenceDirection={priceDifferenceDirection}
        priceDifference={priceDifference}
      />
    </div>
  );
};

export default Home;
