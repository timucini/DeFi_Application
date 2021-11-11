import React, { Component } from 'react';
import Web3 from 'web3';
import '../styling/App.css';
import Token from '../abis/ThesisToken.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar';
import Main from './Main';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    this.getStakingBalance()
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
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }

    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }

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
      }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    console.log("EthSwap Address: " + this.state.ethSwap._address)
    console.log(this.state.ethSwap)
    console.log("Sender Account: " + this.state.account)
    // NEED TO APPROVE IT BEFORE SELL!!
    this.state.token.methods.approve(this.state.ethSwap._address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.stakeTokens().send({ value: amount, from: this.state.account}).on('transactionHash', (hash) => {
      let balance = this.state.stakingBalance + amount
      this.setState({ stakingBalance: balance})
      this.setState({ loading: false })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.unstakeTokens().send({ from: this.state.account, value: amount }).on('transactionHash', (hash) => {
      let balance = this.state.stakingBalance - amount
      this.setState({ stakingBalance: balance})
      this.setState({ loading: false })
    })
  }

  getStakingBalance = async () => {
    let balance  = await this.state.ethSwap.methods.stakingBalance(this.state.account).call()
    this.setState({ stakingBalance: balance.toString() })
    console.log(this.state.stakingBalance)
  }


  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
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
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>

                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
