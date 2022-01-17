import React, { Component } from 'react'
import BuyForm from './BuyForm'
import SellForm from './SellForm'
import StakeForm from './StakeForm'
import UnStakeForm from './UnStakeForm'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

/**
 * @author Timur Burkholz
 * @description compents used as parent for buy / sell / stake / unstake form
 * @version 1.0.0
 */
class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ethBalance: '0',
      tokenBalance: '0',
      stakingBalance: '0'
    }
  }

  componentDidMount() {
    this.setState({
      stakingBalance: this.props.stakingBalance,
      tokenBalance: this.props.tokenBalance,
      ethBalance: this.props.ethBalance
    })
  }

  componentWillReceiveProps(nextprobs) {
    console.log("received")
    console.log(nextprobs)
    this.setState({
      stakingBalance: nextprobs.stakingBalance,
      tokenBalance: nextprobs.tokenBalance,
      ethBalance: nextprobs.ethBalance
    })
  }

  render() {

    return (
      <div id="content" className="mt-3 bg-dark text-white" style={{ borderRadius: '25px', padding: '20px' }}>
        <Tabs
         variant="fullWidth">
          <TabList>
            <Tab>Buy</Tab>
            <Tab>Sell</Tab>
            <Tab>Stake</Tab>
            <Tab>Unstake</Tab>
          </TabList>

          <TabPanel>
            <BuyForm
              key={JSON.stringify(this.props)}
              ethBalance={this.state.ethBalance}
              tokenBalance={this.state.tokenBalance}
              buyTokens={this.props.buyTokens}
            />
          </TabPanel>
          <TabPanel>
            <SellForm
              key={JSON.stringify(this.props)}
              ethBalance={this.state.ethBalance}
              tokenBalance={this.state.tokenBalance}
              sellTokens={this.props.sellTokens}
            />
          </TabPanel>
          <TabPanel>
            <StakeForm
              key={JSON.stringify(this.props)}
              stakeTokens={this.props.stakeTokens}
              stakingBalance={this.state.stakingBalance}
              tokenBalance={this.state.tokenBalance}
              ethBalance={this.state.ethBalance}
            />
          </TabPanel>
          <TabPanel>
            <UnStakeForm
              key={JSON.stringify(this.props)}
              unstakeTokens={this.props.unstakeTokens}
              stakingBalance={this.state.stakingBalance}
              tokenBalance={this.state.tokenBalance}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default Main;
