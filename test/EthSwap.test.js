const Token = artifacts.require("Token")
const EthSwap = artifacts.require("EthSwap")

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n,'ether')
}

contract('EthSwap',([deployer, investor])=>{
    let token , ethSwap

    before(async () => {

        token = await Token.new()
        console.log('token address',token.address)
        //ethSwap = await EthSwap.new()
        //insert token
        ethSwap = await EthSwap.new(token.address)

        console.log('deployer address',deployer.address)
        console.log('investor address',investor.address)
        console.log('ethSwap address',ethSwap.address)
        console.log('token address',token.address)

        //Transfer all tokens to EthSwap (1 million)
        //await token.transfer(ethSwap.address, '1000000000000000000000000')
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    describe('Token deployment', async () => {
        it('contract has a name', async() =>{
            const name = await token.name()
            assert.equal(name, 'Dapp Token')

        })
    });    

    describe('EthSwap deployment', async () => {
        it('contract has a name', async() =>{            
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('contract has tokens', async () =>{
            //let token = await Token.new()
            //let ethSwap = await EthSwap.new()          
            let balance = await token.balanceOf(ethSwap.address)
            //console.log('balance:',balance.toString())
            //assert.equal(balance.toString(),'1000000000000000000000000')
            assert.equal(balance.toString(),tokens('1000000'))
        })
    });
    
    describe('sellTokens', async () => {
        let result

        before(async () =>{
            //Purchase tokens before each example
            let ehtSwapBalanceN = await token.balanceOf(ethSwap.address);
            console.log('ehtSwapBalance Before :',ehtSwapBalanceN.toString())
            let investorBalanceN = await token.balanceOf(investor);
            console.log('investor address',investor.address)
            console.log('investorBalance Before :',investorBalanceN.toString())
            let ethSwapBalanceWeb3N = await web3.eth.getBalance(ethSwap.address)
            console.log('ethSwapBalanceWeb3N Before :',ethSwapBalanceWeb3N.toString())        

            result =  await ethSwap.buyTokens({from : investor, value : web3.utils.toWei('1','ether')})
            

        })
        it('Allows user to instantly purchase tokens from ethSwap for a fixed price', async () => {
            //  Check investor token after purchase
            let investorBalance = await token.balanceOf(investor);
            console.log('investorBalance :',investorBalance.toString())
            assert.equal(investorBalance.toString(), tokens('100'))

            //  Check ethSwap balance after purchase
            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            console.log('ethSwapBalance',ethSwapBalance.toString())
            assert.equal(ethSwapBalance.toString(),tokens('999900'))
            
            let ethSwapBalanceWeb3 = await web3.eth.getBalance(ethSwap.address)
            console.log('ethSwapBalanceWeb3',ethSwapBalanceWeb3.toString())
            assert.equal(ethSwapBalanceWeb3.toString(),web3.utils.toWei('1','Ether'))

            //console.log(result.logs[0].args)
            const event = result.logs[0].args
            assert.equal(event.account , investor)
            assert.equal(event.token , token.address)
            assert.equal(event.amount.toString() , tokens('100').toString())
            assert.equal(event.rate.toString() , '100')
        })
    });

        describe('buyTokens', async () => {
        let result

        before(async () =>{

            let investorBalanceN = await token.balanceOf(investor);
            console.log('investor address',investor.address)
            console.log('investorBalance Before :',investorBalanceN.toString())

            //  Investor must approve tokens before the purchase
            await token.approve(ethSwap.address, tokens('100'), {from : investor});
            //  Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'),{from : investor})

        })
        it('Allows user to instantly sell tokens from ethSwap for a fixed price', async () => {
            let investorBalance = await token.balanceOf(investor);
            console.log('investorBalance :',investorBalance.toString())
            assert.equal(investorBalance.toString(), tokens('0'))

            let ethSwapBalance = await token.balanceOf(ethSwap.address);
            console.log('ethSwapBalance',ethSwapBalance.toString())
            assert.equal(ethSwapBalance.toString(),tokens('1000000'))
            
            let ethSwapBalanceWeb3 = await web3.eth.getBalance(ethSwap.address)
            console.log('ethSwapBalanceWeb3',ethSwapBalanceWeb3.toString())
            assert.equal(ethSwapBalanceWeb3.toString(),web3.utils.toWei('0','Ether'))

            const event = result.logs[0].args
            assert.equal(event.account , investor)
            assert.equal(event.token , token.address)
            assert.equal(event.amount.toString() , tokens('100').toString())
            assert.equal(event.rate.toString() , '100')

            //  FAILURE : invester can't sell more tokens than they have
            await ethSwap.sellTokens(tokens('500'), {from : investor}).should.be.rejected;

        })
    });
    

})