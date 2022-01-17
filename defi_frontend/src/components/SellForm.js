import React, { Component } from 'react'
import tokenLogo from '../token-logo.png'
import ethLogo from '../eth-logo.png'
import Web3 from 'web3'

/**
 * @author Timur Burkholz
 * @description Sell form to sell tokens
 * @version 1.0.0
 */
class SellForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ethBalance: '0',
      tokenBalance: '0',
      output: '0'
    }
  }

  componentDidMount() {
    this.setState({
      tokenBalance: this.props.tokenBalance,
      ethBalance: this.props.ethBalance
    })
  }

  componentWillReceiveProps(nextprobs) {
    console.log("received")
    console.log(nextprobs)
    this.setState({
      tokenBalance: nextprobs.tokenBalance,
      ethBalance: nextprobs.ethBalance
    })
  }

  render() {

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

    return (
      <form className="mb-3" onSubmit={(event) => {
          event.preventDefault()
          let etherAmount
          etherAmount = this.input.value.toString()
          etherAmount = web3.utils.toWei(etherAmount, 'Ether')
          this.props.sellTokens(etherAmount)
        }}>
        <div>
          <label className="float-left"><b>Input&nbsp;</b></label>
          <span className="float-right text-muted">
            &nbsp;&nbsp;Balance: {web3.utils.fromWei(this.state.tokenBalance, 'Ether')}
          </span>
        </div>
        <div className="input-group mb-4">
          <input
            type="number"
            onChange={(event) => {
              const tokenAmount = this.input.value.toString()
              this.setState({
                output: tokenAmount / 100
              })
            }}
            ref={(input) => { this.input = input }}
            className="form-control form-control-lg"
            placeholder="0"
            max={web3.utils.fromWei(this.state.tokenBalance, 'Ether')}
            min="0"
            step="any"
            required />
          <div className="input-group-append">
            <div className="input-group-text bg-dark text-white">
              <img src={tokenLogo} height='34' alt=""/>
              &nbsp; THES
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col"><hr/></div>
            <div class="col-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-arrow-down-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
              </svg>
            </div>
          <div class="col"><hr/></div>
        </div>
        <div>
          <label className="float-left"><b>Output</b></label>
          <span className="float-right text-muted">
            &nbsp;&nbsp;Balance: {web3.utils.fromWei(this.state.ethBalance, 'Ether')}
          </span>
        </div>
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="0"
            value={this.state.output}
            disabled
            style={{ backgroundColor: '#545454'}}
          />
          <div className="input-group-append">
            <div className="input-group-text bg-dark text-white">
              <img src={ethLogo} height='34' alt=""/>
              &nbsp;&nbsp;&nbsp; ETH
            </div>
          </div>
        </div>
        <div className="mb-3">
          <span className="float-left text-muted">Exchange Rate</span>
          <span className="float-right text-muted"> 100 THES = 1 ETH</span>
        </div>
        <div class="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary btn-block btn-lg">SWAP!</button>
        </div>
      </form>
    );
  }
}

export default SellForm;