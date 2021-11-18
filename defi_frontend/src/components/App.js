import React, { Component } from 'react';
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

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      stakingBalance: '0'
    }
  }


  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const ethAmount = await web3.eth.getBalance(this.state.account)

    this.setState({ ethBalance: ethAmount})
    
    // Load Token
    const networkId =  await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      if (tokenBalance != null ) {
        this.setState({ tokenBalance: tokenBalance.toString() })
      }
    } else {
      window.alert('Token contract not deployed to detected network.')
      toast.error('Token contract not deployed to detected network.')
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
      toast.error('EthSwap contract not deployed to detected network.')
    }
    await this.updateBalances()
    this.setState({ loading: false })
    console.log(this.state.token)
  }


  // load ethererum provider with MetaMask
  async loadWeb3() {
    if(window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const requestAccount = accounts[0]
        this.setState({ account: requestAccount})
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        toast.error('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', async (hash) => {
      await this.updateBalances()
      toast.success("Transaction successfully completed")
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    console.log(this.state.ethSwap)
    // NEED TO APPROVE IT BEFORE SELL!!
    this.state.token.methods.approve(this.state.ethSwap._address, tokenAmount).send({ from: this.state.account }).on('transactionHash',  (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
        await this.updateBalances()
        toast.success("Transaction successfully completed")
      })
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.stakeTokens().send({ value: amount, from: this.state.account}).on('transactionHash', async (hash) => {
      await this.updateBalances()
      toast.success("Transaction successfully completed")
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.unstakeTokens(this.state.account).send({ value: amount, from: this.state.account }).on('transactionHash', async (hash) => {
      await this.updateBalances()
      toast.success("Transaction successfully completed")
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  async updateBalances() {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    let ethBalance = await web3.eth.getBalance(this.state.account)
    let tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call()
    let stakingBalance = await this.state.ethSwap.methods.stakingBalance(this.state.account).call()
    this.setState({ ethBalance: ethBalance.toString()})
    this.setState({ tokenBalance: tokenBalance.toString() })
    this.setState({ stakingBalance: stakingBalance.toString() })
  } 

  render() {
    let content
    if(this.state.loading) {
      content = <div class="d-flex justify-content-center container">
          <Loader type="Bars" color="#00BFFF" height={80} width={80} class="align-self-center" />
      </div>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        stakingBalance={this.state.stakingBalance}
      />
    }

    return (
      <div class="box">
        <div style={{ backgroundImage: 'linear-gradient(#e66465, #9198e5);' }}>
          <Navbar account={this.state.account} key={this.state.account} />
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
}

export default App;
