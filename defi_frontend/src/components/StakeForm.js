import React, { Component } from 'react'
import Web3 from 'web3'
import ethLogo from '../eth-logo.png'


class StakeForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      output: '0'
    }
  }
    
    
    render() {

        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");

        return (
          <div id="content" className="mt-3">
                 <table className="table table-borderless text-muted text-center">
              <thead>
                <tr>
                  <th scope="col">Staking Balance</th>
                  <th scope="col">Token Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{web3.utils.fromWei(this.props.stakingBalance, 'Ether')} ETH</td>
                  <td>{web3.utils.fromWei(this.props.tokenBalance, 'Ether')} THES</td>
                </tr>
              </tbody>
            </table>
    
            <div className="card mb-4" >
    
    <div className="card-body">
    
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
        <div className="input-group mb-4">
          <input
            type="text"
            ref={(input) => { this.input = input }}
            className="form-control form-control-lg"
            placeholder="0"
            required />
          <div className="input-group-append">
          <div className="input-group-text">
              <img src={ethLogo} height='32' alt=""/>
              &nbsp;&nbsp;&nbsp; ETH
            </div>
          </div>
        </div>
        <div className="mb-3">
          <span className="float-left text-muted">Staking Rate 1 ETH = 10 THES</span>
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg">STAKE!</button>
      </form>
    </div>
    </div>
          </div>
        );
      }
    }

export default StakeForm;