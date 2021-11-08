import logo from '../logo.svg';
import React, { useState, useEffect } from "react";
import Web3 from 'web3';
import '../styling/App.css';
import ThesisToken from '../abis/ThesisToken.json'

function App() {
  const [account, setAccount] = useState('0x0');
  const [daiToken, setDaiToken] = useState([]);
  const [thesisToken, setThesisToken] = useState([]);
  const [ethSwap, setEthSwap] = useState([]);
  const [thesisTokenBalance, setThesisTokenBalance] = useState('0');
  const [stakingBalance, setStakingBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  /*
  this.state = {
    account: '0x0',
    daiToken: {},
    dappToken: {},
    tokenFarm: {},
    daiTokenBalance: '0',
    dappTokenBalance: '0',
    stakingBalance: '0',
    laoding: true
  }
  */

  // to connect with Metamask -> to connect to a Blockchain
  const loadWeb3 =  async () => {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  const loadBlockchainData = async () => {
    const web3 = window.web3

    const accounts =  await web3.eth.getAccounts()
    setAccount(accounts[0])
    web3.eth.defaultAccount = web3.eth.accounts[0]
    // we wan't to fetch the content form the Ganache Blockchain -> where our Smart Contracts are on
    const networkId = await web3.eth.net.getId() // should be -> 5777
    console.log(networkId)
    // Load ThesisDoken (Smart Contract)
    const thesisTokenData = ThesisToken.networks[networkId]
    if(thesisTokenData) {
      // load the json ABI File of the Contract with the network Id
      const thesisToken = new web3.eth.Contract(ThesisToken.abi, thesisTokenData.address) // -> create a JavaScript Version (web3-Version) of the Contract
      setThesisToken(thesisToken)
      console.log(account)
      let thesisTokenBalance = await thesisToken.methods.balanceOf(account).call() // fetch the Balance of the account (Smart-Contract Method) -> call when you reading information
      setThesisTokenBalance(thesisTokenBalance.toString());
      console.log(thesisTokenBalance)
      console.log("loaded ThesisToken Contract")
    } else {
      window.alert('ThesisToken contract not deployed to detacted network.')
    }

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
