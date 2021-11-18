import React, { Component } from 'react'
import Web3 from 'web3'
import ethLogo from '../eth-logo.png'


class StakeForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ethBalance: '0',
      tokenBalance: '0',
      stakingBalance: '0',
      output: '0'
    }
  }

  componentDidMount() {
    this.setState({
      tokenBalance: this.props.tokenBalance,
      ethBalance: this.props.ethBalance,
      stakingBalance: this.props.stakingBalance
    })
  }

  componentWillReceiveProps(nextprobs) {
    console.log("received")
    console.log(nextprobs)
    this.setState({
      tokenBalance: nextprobs.tokenBalance,
      ethBalance: nextprobs.ethBalance,
      stakingBalance: nextprobs.stakingBalance
    })
  }
    
    
    render() {

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

        return (
          <div id="content" className="mt-3">
                 <table className="table table-borderless text-white text-center">
              <thead>
                <tr>
                  <th scope="col">Staking Balance</th>
                  <th scope="col">Token Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{web3.utils.fromWei(this.state.stakingBalance, 'Ether')} ETH</td>
                  <td>{web3.utils.fromWei(this.state.tokenBalance, 'Ether')} THES</td>
                </tr>
              </tbody>
            </table>
    <hr/>
            <div className="card mb-4 border-0">
    <div className="card-body bg-dark text-white">
    
      <form className="mb-3" onSubmit={(event) => {
          event.preventDefault()
          let amount
          amount = this.input.value.toString()
          amount = web3.utils.toWei(amount, 'Ether')
          this.props.stakeTokens(amount)
        }}>
        <div>
          <label className="float-left"><b>Stake Tokens</b></label>
          <span className="float-right text-muted">
            &nbsp;&nbsp;Balance: {web3.utils.fromWei(this.props.ethBalance, 'Ether')}
          </span>
        </div>
        <div className="input-group mb-1">
          <input
            type="number"
            ref={(input) => { this.input = input }}
            className="form-control form-control-lg"
            placeholder="0"
            max={web3.utils.fromWei(this.state.ethBalance, 'Ether')}
            min="0"
            step="any"
            required />
          <div className="input-group-append">
          <div className="input-group-text bg-dark text-white">
              <img src={ethLogo} height='34' alt=""/>
              &nbsp;&nbsp;&nbsp; ETH
            </div>
          </div>
        </div>
        <div className="mb-3">
          <span className="float-left text-muted">Staking Rate: 1 ETH = 10 THES</span>
        </div>
        <div class="d-flex justify-content-center">
          <button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
        </div>
      </form>
    </div>
    </div>
          </div>
        );
      }
    }

export default StakeForm;