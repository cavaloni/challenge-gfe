'use client'
import React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react';


const Home = () => {
  const currencyList = ['USD', 'EUR', 'GBP', 'CNY', 'JPY'];

  const [currentWUCPrice, updateCurrentWUCPrice] = useState(0);
  const [previousWUCPrice, updatePreviousWUCPrice] = useState(0);
  const [fetching, updateFetching] = useState(false);
  const [currency, updateCurrency] = useState(currencyList[0]);
  const [amount, updateAmount] = useState(0)
  const [totalAmount, updateTotalAmount] = useState(0)

  const intervalFetcher = useRef();

  const getCurrentVal = async (currentCurrency, currentAmount) => {
	if (fetching) return
	console.log(currentCurrency)
    updateFetching(true);
    const url = `https://api.frontendeval.com/fake/crypto/${currentCurrency.toLowerCase()}`
    const res = await fetch(url);
    let data;
    try {
      data = await res.json()
    } catch (e) {
      console.log(e)
    }
	const curVal = data.value
    console.log('something', typeof curVal, typeof currentAmount, currentAmount, curVal)
    const totalVal = currentAmount * curVal
    console.log(currentAmount, curVal, totalVal)
    updateTotalAmount(totalVal)
    updatePreviousWUCPrice(currentWUCPrice);
    updateCurrentWUCPrice(curVal);
    updateFetching(false);
	console.count('getCurrentVal')
  }

  const setIntervalFetcher = (currentCurrency, currentAmount) => {
    if (intervalFetcher.current) {
      clearInterval(intervalFetcher.current);
    }
	try {
		getCurrentVal(currentCurrency, currentAmount);
	  } catch (e) {
		console.log(e)
	  }
    if (!fetching && currency) {
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
	  setIntervalFetcher(currency, amount)
  },[])
  
  const handleCurrencyChange = ({ target: { value } }) => {
	console.log('--------------------')
    updateCurrency(value);
	setIntervalFetcher(value, amount)
  };

  const handleAmountChange = ({ target: { value }}) => {
    updateAmount(value)
	setIntervalFetcher(currency, value)
  }
  console.log(currency)
  return (
    <div>
      <input value={amount} type={"number"} onChange={e => handleAmountChange(e)}/>
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