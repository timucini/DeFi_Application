import React, { useState, useEffect} from 'react';
import Web3 from 'web3';
import '../styling/App.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Token from '../abis/ThesisToken.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar';
import Main from './Main';
import Loader from "react-loader-spinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  const [account, setAccount] = useState('')
  const [token, setToken] = useState([])
  const [ethSwap, setEthSwap] = useState([])
  const [ethBalance, setEthBalance] = useState('0')
  const [tokenBalance, setTokenBalance] = useState('0')
  const [loading, setLoading] = useState(true)
  const [stakingBalance, setStakingBalance] = useState('0')

  const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

  useEffect(() => {
    async function loadData() {
      await loadWeb3()
    }
    loadData()
  }, [])
  


  async function loadBlockchainData() {
    const ethAmount = await web3.eth.getBalance(account)

    setEthBalance(ethAmount)
    
    // Load TokenData
    const networkId =  await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      setToken(token)
      let tokenBalance = await token.methods.balanceOf(account).call()
      if (tokenBalance != null ) {
         setTokenBalance(tokenBalance.toString())
      }
    } else {
      window.alert('Token contract not deployed to detected network.')
      toast.error('Token contract not deployed to detected network.')
    }

    // Load EthSwap 
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      setEthSwap(ethSwap)
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
      toast.error('EthSwap contract not deployed to detected network.')
    }
    await updateBalances()
    setLoading(false)
    console.log(token)
  }


  // load ethererum provider with MetaMask
  async function loadWeb3() {
    if(window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const requestAccount = accounts[0]
        setAccount(requestAccount)
        await loadBlockchainData()
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        toast.error('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
  }

  async function buyTokens(etherAmount) {
    ethSwap.methods.buyTokens().send({ value: etherAmount, from: account }).on('transactionHash', async (hash) => {
      await updateBalances()
      setLoading(false)
    }).catch((err) => {
      toast.error(err.message)
      setLoading(false)
    }) 
  }

  async function sellTokens(tokenAmount) {
    console.log(ethSwap)
    // NEED TO APPROVE IT BEFORE SELL!!
    token.methods.approve(ethSwap._address, tokenAmount).send({ from: account }).on('transactionHash',  (hash) => {
      ethSwap.methods.sellTokens(tokenAmount).send({ from: account }).on('transactionHash', async (hash) => {
        await updateBalances()
        setLoading(false)
      })
    }).catch((err) => {
      toast.error(err.message)
      setLoading(false)
    }) 
  }

  async function stakeTokens(amount) {
    ethSwap.methods.stakeTokens().send({ value: amount, from: account}).on('transactionHash', async (hash) => {
      await updateBalances()
      setLoading(false)
    }).catch((err) => {
      toast.error(err.message)
      setLoading(false)
    }) 
  }

  async function unstakeTokens(amount) {
    ethSwap.methods.unstakeTokens().send({ from: account, value: amount }).on('transactionHash', async (hash) => {
      await updateBalances()
      setLoading(false)
    }).catch((err) => {
      toast.error(err.message)
      setLoading(false)
    }) 
  }

  async function getStakingBalance() {
    let balance  = await ethSwap.methods.stakingBalance(account).call()
    setStakingBalance(balance.toString())
  }

  async function updateBalances() {
    let ethBalance = await web3.eth.getBalance(account)
    let tokenBalance = await token.methods.balanceOf(account).call()
    let stakingBalance = await ethSwap.methods.stakingBalance(account).call()
    setEthBalance(ethBalance.toString())
    setTokenBalance(tokenBalance.toString())
    setStakingBalance(stakingBalance.toString())
  } 

  let content
    if(loading) {
      content = <div class="d-flex justify-content-center container">
          <Loader type="Bars" color="#00BFFF" height={80} width={80} class="align-self-center" />
      </div>
    } else {
      content = <Main
       key={stakingBalance}
        ethBalance={ethBalance}
        tokenBalance={tokenBalance}
        buyTokens={buyTokens}
        sellTokens={sellTokens}
        stakeTokens={stakeTokens}
        unstakeTokens={unstakeTokens}
        stakingBalance={stakingBalance}
      />
    }

    return (
      <div class="box">
        <div style={{ backgroundImage: 'linear-gradient(#e66465, #9198e5);' }}>
          <Navbar account={account} key={account} />
          <div className="container-fluid mt-5 d-flex justify-content-center">
            <div className="row">
              <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '800px', minWidth: '600px' }}>
                <div className="content mr-auto ml-auto">

                  {content}

                </div>
              </main>
            </div>
            <ToastContainer
              position="bottom-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              toastStyle={{ backgroundColor: "#121212", color:"white" }}
            />
          </div>
        </div>
      </div>
    );
}

export default App;
