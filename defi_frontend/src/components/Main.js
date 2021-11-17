import React, { useState, useEffect} from 'react';
import BuyForm from './BuyForm'
import SellForm from './SellForm'
import StakeForm from './StakeForm'
import UnStakeForm from './UnStakeForm'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function Main(props) {

  const [stakingBalance, setStakingBalance] = useState(props.stakingBalance);
  // This will launch only if propName value has chaged.
  useEffect(() => { 
    console.log(props.stakingBalance)
    setStakingBalance(props.stakingBalance) }, [props.stakingBalance]);
  
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
            key={JSON.stringify(props)}
            ethBalance={props.ethBalance}
            tokenBalance={props.tokenBalance}
            buyTokens={props.buyTokens}
          />
        </TabPanel>
        <TabPanel>
          <SellForm
            key={JSON.stringify(props)}
            ethBalance={props.ethBalance}
            tokenBalance={props.tokenBalance}
            sellTokens={props.sellTokens}
          />
        </TabPanel>
        <TabPanel>
          <StakeForm
            stakeTokens={props.stakeTokens}
            stakingBalance={stakingBalance}
            tokenBalance={props.tokenBalance}
            ethBalance={props.ethBalance}
          />
        </TabPanel>
        <TabPanel>
          <UnStakeForm
            key={JSON.stringify(props)}
            unstakeTokens={props.unstakeTokens}
            stakingBalance={props.stakingBalance}
            tokenBalance={props.tokenBalance}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default Main;
