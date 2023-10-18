'use client'
import React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react';
import useDebounce from './util/debounce';


const Home = () => {
  const currencyList = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'];

  const [currentWUCPrice, updateCurrentWUCPrice] = useState(0);
  const [previousWUCPrice, updatePreviousWUCPrice] = useState(0);
  const [fetching, updateFetching] = useState(false);
  const [currency, updateCurrency] = useState(currencyList[0]);
  const [amount, updateAmount] = useState(0)
  const [totalAmount, updateTotalAmount] = useState(0)
  const debouncedInputVal = useDebounce(amount, 500)

  const intervalFetcher = useRef();

  const getCurrentVal = async (currentCurrency: string, currentAmount: number) => {
    // prevent race conditions with fetching boolean
    updateFetching(true);
    const url = `https://api.frontendeval.com/fake/crypto/${currentCurrency.toLowerCase()}`
    let res
    try {
      res = await fetch(url)
    } catch (e) {
      console.log(e)
    }
    if (res) {
      let data;
      try {
        data = await res.json()
      } catch (e) {
        console.log(e)
      }
      const curVal = data.value
      const totalVal = currentAmount * curVal
      updateTotalAmount(totalVal)
      const differenceFromPreviousPrice = 
      updatePreviousWUCPrice(currentWUCPrice);
      updateCurrentWUCPrice(curVal);
      updateFetching(false);
    }
  }

  const setIntervalFetcher = (currentCurrency: string, currentAmount: number) => {
    if (intervalFetcher.current) {
      clearInterval(intervalFetcher.current);
    }

    if (!fetching && currency) {
      try {
        getCurrentVal(currentCurrency, currentAmount);
      } catch (e) {
        console.log(e)
      }
      intervalFetcher.current = setInterval(() => {
        if (!fetching) {
          try {
            getCurrentVal(currentCurrency, currentAmount);
          } catch (e) {
            console.log(e)
          }
        }
      }, 5000);
    }
  }

  useEffect(() => {
    if (debouncedInputVal) {
      setIntervalFetcher(currency, debouncedInputVal)
    } else if (intervalFetcher.current && !debouncedInputVal) {
      // cleanup if input is empty
      clearInterval(intervalFetcher.current)
    }
  }, [debouncedInputVal])

  const handleCurrencyChange = ({ target: { value } }) => {
    updateCurrency(value);
    setIntervalFetcher(value, amount)
  };

  const handleAmountChange = ({ target: { value } }) => {
    updateAmount(value)
  }

  return (
    <div>
      <input value={amount} type={"number"} onChange={e => handleAmountChange(e)} />
      <select
        value={currency}
        onChange={(e) => handleCurrencyChange(e)}
      >
        {currencyList.map((cur) => (
          <option value={cur} key={cur}>
            {cur}
          </option>
        ))}
      </select>
      <div>{totalAmount}</div>
    </div>
  );
};

export default Home