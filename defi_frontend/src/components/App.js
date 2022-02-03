import React, { Component } from 'react';
import Web3 from 'web3';
import '../styling/App.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Token from '../abis/ThesisToken.json'
import ThesisSwap from '../abis/ThesisSwap.json'
import Navbar from './Navbar';
import Main from './Main';
import Loader from "react-loader-spinner";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * @author Timur Burkholz
 * @description main components of react app. Here functions are defined and components are loaded
 * @version 1.0.0
 */
class App extends Component {

  /**
   * @description will be called when componend is loaded or refreshed. Connect MetaMask and load Blockchain-Data
   */
  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      thesisSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true,
      stakingBalance: '0'
    }
  }

  /**
   * @description loading of Blockchain-Data. Here data of both smart contracts is loaded from connected network. 
   * @throws alert if smart contract are not deployed on connected network.
   */
  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const ethAmount = await web3.eth.getBalance(this.state.account)

    this.setState({ ethBalance: ethAmount})
    
    // Load Thesis Token Smart Contract
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

    // Load ThesisSwap Smart Contract
    const thesisSwapData = ThesisSwap.networks[networkId]
    if(thesisSwapData) {
      const thesisSwap = new web3.eth.Contract(ThesisSwap.abi, thesisSwapData.address)
      this.setState({ thesisSwap })
    } else {
      window.alert('thesisSwap contract not deployed to detected network.')
      toast.error('thesisSwap contract not deployed to detected network.')
    }
    await this.updateBalances()
    this.setState({ loading: false })
    console.log(this.state.token)
  }


   /**
   * @description load ethererum provider with MetaMask. Web3 ist mandetory to interact with blockchain.
   * @throws alert if MetaMask can't be loaded.
   */
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

  /**
   * @description calls thesisSwap Smart Contract "buyTokens" function. Here token is bought with ether
   * @param etherAmount : amount of Ether to buy Tokens with
   */
  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.thesisSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', async (hash) => {
      toast.success("Transaction successfully completed")
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  /**
   * @description first calls "approve" function of thesisSwap Smart Contract. Secondly, if approved, "sellTokens" function of contract is called.
   * here tokens can be sold for ether. 
   * @param tokenAmount : amount of tokens to sell for ether
   */
  sellTokens =  async (tokenAmount) => {
    await this.setState({ loading: true })
    console.log(this.state.thesisSwap)
    // NEED TO APPROVE IT BEFORE SELL!!
    await this.state.token.methods.approve(this.state.thesisSwap._address, tokenAmount).send({ from: this.state.account });
      this.state.thesisSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', async (hash) => { 
      }).catch((err) => {
        toast.error(err.message)
      }).finally( async () => {
        this.setState({ loading: false })
        toast.success("Transaction successfully completed")
        await this.updateBalances()
    })

  }

  /**
   * @description calls thesisSwap Smart Contract "stakeTokens" function. Ether is staked, Staking balance of investor will be saved
   * @param amount : amount of Ether to stake
   */
  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.thesisSwap.methods.stakeTokens().send({ value: amount, from: this.state.account}).on('transactionHash', async (hash) => {
      toast.success("Transaction successfully completed")
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  /**
   * @description calls thesisSwap Smart Contract "unstakeTokens" function. Here Ether is unstaked, investor will receive his invested ether.
   * @param amount : amount of Ether to unstake
   */
  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.thesisSwap.methods.unstakeTokens(this.state.account, amount).send({ from: this.state.account }).on('transactionHash', async (hash) => {
      toast.success("Transaction successfully completed")
    }).catch((err) => {
      toast.error(err.message)
    }).finally( async () => {
      this.setState({ loading: false })
      await this.updateBalances()
    });
  }

  /**
   * @description updates states
   */
  async updateBalances() {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    let ethBalance = await web3.eth.getBalance(this.state.account)
    let tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call()
    let stakingBalance = await this.state.thesisSwap.methods.stakingBalance(this.state.account).call()
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
