import React, { Component } from 'react'
import BuyForm from './BuyForm'
import SellForm from './SellForm'
import StakeForm from './StakeForm'
import UnStakeForm from './UnStakeForm'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentForm: 'buy'
    }
  }

  render() {
    let content
    if(this.state.currentForm === 'buy') {
      content = <BuyForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        buyTokens={this.props.buyTokens}
      />
    }
    if(this.state.currentForm === 'sell') {
      content = <SellForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        sellTokens={this.props.sellTokens}
      />
    }
    if(this.state.currentForm === 'stake') {
      content = <StakeForm
      stakeTokens={this.props.stakeTokens}
      unstakeTokens={this.props.unstakeTokens}
      stakingBalance={this.props.stakingBalance}
      tokenBalance={this.props.tokenBalance}
      />
    }

    return (
      <div id="content" className="mt-3">

<Tabs>
    <TabList>
      <Tab>Buy</Tab>
      <Tab>Sell</Tab>
      <Tab>Stake</Tab>
      <Tab>Unstake</Tab>
    </TabList>

    <TabPanel>
      <BuyForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        buyTokens={this.props.buyTokens}
      />
    </TabPanel>
    <TabPanel>
      <SellForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        sellTokens={this.props.sellTokens}
      />
    </TabPanel>
    <TabPanel>
      <StakeForm
        stakeTokens={this.props.stakeTokens}
        stakingBalance={this.props.stakingBalance}
        tokenBalance={this.props.tokenBalance}
      />
    </TabPanel>
    <TabPanel>
      <UnStakeForm
        unstakeTokens={this.props.unstakeTokens}
        stakingBalance={this.props.stakingBalance}
        tokenBalance={this.props.tokenBalance}
      />
    </TabPanel>
  </Tabs>

      </div>
    );
  }
}

export default Main;
