import logo from '../logo.svg';
import React, { useState, useEffect } from "react";
import Web3 from 'web3';
import '../styling/App.css';
import ThesisToken from '../abis/ThesisToken.json'
import EthSwap from '../abis/EthSwap.json'

function App() {
  const [account, setAccount] = useState('0x0');
  const [thesisToken, setThesisToken] = useState([]);
  const [ethSwap, setEthSwap] = useState([]);
  const [thesisTokenBalance, setThesisTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [stakingBalance, setStakingBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWeb3();
  }, []);

  
  // to connect with Metamask -> to connect to a Blockchain
  const loadWeb3 =  async () => {
    if(window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const requestAccount = accounts[0]
      setAccount(requestAccount)
      await loadBlockchainData(requestAccount);
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const loadBlockchainData = async (requestAccount) => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const ethAmount = await web3.eth.getBalance(requestAccount)

    setEthBalance(ethAmount)
    
    // Load thesisToken
    const networkId = await web3.eth.net.getId() 
    const thesisTokenData = ThesisToken.networks[networkId]
    if(thesisTokenData) {
      // load the json ABI File of the Contract with the network Id
      const thesisToken = new web3.eth.Contract(ThesisToken.abi, thesisTokenData.address) // -> create a JavaScript Version (web3-Version) of the Contract
      setThesisToken(thesisToken)
      console.log(requestAccount)
      let thesisTokenBalance = await thesisToken.methods.balanceOf(requestAccount).call() // fetch the Balance of the account (Smart-Contract Method) -> call when you reading information
      setThesisTokenBalance(thesisTokenBalance.toString());
      console.log(thesisTokenBalance)
      console.log("loaded ThesisToken Contract")
    } else {
      window.alert('ThesisToken contract not deployed to detacted network.')
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      setEthSwap(ethSwap)
      console.log("Loaded Ethswap")
      console.log("EthBalance" + ethBalance)
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }

    setLoading(false)
  }

  const buyTokens = (etherAmount) => {
    setLoading(true)
    ethSwap.methods.buyTokens().send({ value: etherAmount, from: account }).on('transactionHash', (hash) => {
      setLoading(false)
    })
  }

  const sellTokens = (tokenAmount) => {
    setLoading(true)
    // NEED TO APPROVE IT BEFORE SELL!!
    thesisToken.methods.approve(ethSwap.address, tokenAmount).send({ from: account }).on('transactionHash', (hash) => {
      ethSwap.methods.sellTokens(tokenAmount).send({ from: account }).on('transactionHash', (hash) => {
        setLoading(false)
      })
    })
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
