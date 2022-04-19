const {expect} = require('chai');
const { ethers } = require("hardhat");

describe('Box Contract', () => {
	let Box, box,Jack, jack, box_addr,jack_addr, owner, addr1, addr2;
	const name 					= "Box";
	const symbol 				= "BOX";
	const version 				= "1.0.0";
	const zeroAddr      		= "0x0000000000000000000000000000000000000000000000000000000000000000";
	const MAX_SUPPLY 			= "7777";
	const UpdtMrklRoot  		= "0xc62a029646f4f892956af77127f97afa9bed47f56e2e78fba0d8ff96c2d4fba5";
	const MAX_PUBLIC_MINT 		= "10";
	const PUBLIC_SALE_PRICE 	= "90000000000000"; // 0.00009 ethers == 90000000000000 wei
	const PUBLIC_10_TOKEN_PRICE = "9000000000000000"
	const MAX_WHITELIST_MINT 	= "3";
	const WHITELIST_SALE_PRICE 	= "20000000000000"; // 0.00002 ethers == 20000000000000 wei
	const jack_address			= "0xc3A1Dc669D820baB5eA53C77f190F563762981ee";
	const merkleProof 			= [
									'0x999bf57501565dbd2fdcea36efa2b9aef8340a8901e3459f4a4c926275d36cdb',
									'0x04a10bfd00977f54cc3450c9b25c9b3a502a089eba0097ba35fc33c4ea5fcb54'
								];


	beforeEach(async () => {
		Box = await ethers.getContractFactory('Box');
		box = await upgrades.deployProxy(Box, [], {initializer: 'initialize'});
		[owner, addr1, addr2, _] = await ethers.getSigners();
	});

	describe('Deployment and verifying variables', () => {
	
		it('Should set the right owner', async () => {
			expect(await box.owner()).to.equal(owner.address);
		});

		it('Should verify the name of contract', async () => {
			expect((await box.name()).toString()).to.equal(name);
		});

		it('Should verify the symbol of contract', async () => {
			expect((await box.symbol()).toString()).to.equal(symbol); 
		});

		it('Should verify the PUBLIC_SALE_PRICE of contract', async () => {
			expect((await box.PUBLIC_SALE_PRICE()).toString()).to.equal(PUBLIC_SALE_PRICE); 
		});

		it('Should verify the MAX_PUBLIC_MINT of contract', async () => {
			expect((await box.MAX_PUBLIC_MINT()).toString()).to.equal(MAX_PUBLIC_MINT); 
		});

		it('Should verify the WHITELIST_SALE_PRICE of contract', async () => {
			expect((await box.WHITELIST_SALE_PRICE()).toString()).to.equal(WHITELIST_SALE_PRICE); 
		});

		it('Should verify the MAX_WHITELIST_MINT of contract', async () => {
			expect((await box.MAX_WHITELIST_MINT()).toString()).to.equal(MAX_WHITELIST_MINT); 
		});

        it('Should verify the MAX_SUPPLY of contract', async () => {
	        expect((await box.MAX_SUPPLY()).toString()).to.equal(MAX_SUPPLY);
	    });

        it('Should verify the version of contract', async () => {
			expect(await box.version()).to.equal(version); 
		});

		it('Should verify the whiteListSale of contract to be false', async () => {
			expect(await box.whiteListSale()).to.equal(false); 
		});

		it('Should verify the isRevealed of contract to be false', async () => {
			expect(await box.isRevealed()).to.equal(false); 
		});

		it('Should verify the publicSale of contract to be false', async () => {
			expect(await box.publicSale()).to.equal(false); 
		});

		it('Should verify the merkleRoot of contract to be 0x00...', async () => {
			expect(await box.getMerkleRoot()).to.equal(zeroAddr);
		});


		it('Should verify the totalSupply of contract to be 0', async () => {
			expect(await box.totalSupply()).to.equal('0');
		});

		it('Should verify the tokensMintedtBy of contract to be 0', async () => {
			expect(await box.tokensMintedtBy(owner.address)).to.equal(0);
		});

		it('Should verify the tokensBurntBy of contract to be 0', async () => {
			expect(await box.tokensBurntBy(owner.address)).to.equal(0);
		});

	});

	describe('Setting variable Tx', () =>{
		it("Should set the whiteListSale to True", async function () {
			await box.deployed();
			expect(await box.whiteListSale()).to.equal(false);
			const toggleWhiteListSaleTx = await box.toggleWhiteListSale();
			await toggleWhiteListSaleTx.wait();
			expect(await box.whiteListSale()).to.equal(true);
		});

     
	 	it("Should set the isRevealed to True", async function () {
	        await box.deployed();
	        expect(await box.isRevealed()).to.equal(false);
	        const toggleRevealTx = await box.toggleReveal();
	        await toggleRevealTx.wait();
	        expect(await box.isRevealed()).to.equal(true);
      	});

		it("Should set the publicSale to True", async function () {
	        await box.deployed();
	        expect(await box.publicSale()).to.equal(false);
	        const togglePublicSaleTx = await box.togglePublicSale();
	        await togglePublicSaleTx.wait();
	        expect(await box.publicSale()).to.equal(true);
      	});

		it('should set  and verify MerkleRoot to whitelist the users addresses', async () => {
			await box.deployed();
	        expect(await box.getMerkleRoot()).to.equal(zeroAddr);
	        const setMerkleRootTx = await box.setMerkleRoot(UpdtMrklRoot);
	        await setMerkleRootTx.wait();
	        expect(await box.getMerkleRoot()).to.equal(UpdtMrklRoot);
		});

	});	


	describe('Whitelist and public mint Transactions', () =>{
		it('should whitelistMint a token and verify the possession of the minted token', async () => {
			await box.deployed();

			// Toggle the WhiteList Sale
			const toggleWhiteListSaleTx = await box.toggleWhiteListSale();
			await toggleWhiteListSaleTx.wait();

			// set merkle root
	        const setMerkleRootTx = await box.setMerkleRoot(UpdtMrklRoot);
			await setMerkleRootTx.wait();

			// // mint the token 
	        expect((await box.balanceOf(owner.address)).toString()).to.equal('0');
	        const mintTx = await box.whitelistMint(merkleProof,1,{  value: WHITELIST_SALE_PRICE });
			const receipt = await mintTx.wait();
            console.log("        Whitelist Mint Tx Gas Used:", (receipt.gasUsed).toString(), "gwei");

	        expect((await box.balanceOf(owner.address)).toString()).to.equal('1');

			// verify the owner balance
			const ownerBalance = await box.balanceOf(owner.address);

			// verify the totalSupply
			expect(await box.totalSupply()).to.equal(ownerBalance);

			// verify ownerOf the token using tokenId
			expect((await box.ownerOf(0)).toString()).to.equal(owner.address);
	        
		});

		it('should mint a token and verify the possession of the minted token', async () => {
			await box.deployed();

			// Toggle the public sale
			const togglePublicSaleTx = await box.togglePublicSale();
	        await togglePublicSaleTx.wait();

			// mint the token 
	        expect((await box.balanceOf(owner.address)).toString()).to.equal('0');
	        const mintTx = await box.mint(1,{  value: PUBLIC_10_TOKEN_PRICE });
			const receipt = await mintTx.wait();
            console.log("        Public Mint Tx Gas Used:", (receipt.gasUsed).toString(), "gwei");

	        expect((await box.balanceOf(owner.address)).toString()).to.equal('1');

			// verify the owner balance
			const ownerBalance = await box.balanceOf(owner.address);

			// verify the totalSupply
			expect(await box.totalSupply()).to.equal(ownerBalance);

			// verify ownerOf the token using tokenId
			expect((await box.ownerOf(0)).toString()).to.equal(owner.address);
	        
		});
	});

	
	describe('Burn Transactions', () =>{		
		it('should mint a token and verify the possession of the minted token', async () => {
			await box.deployed();
			const tokens 	= 10;
			const lmt 		= 700;
			let burnArr 	= [6995,6996, 6997, 6998, 6999];
		
			// Toggle the public sale
			const togglePublicSaleTx = await box.togglePublicSale();
			await togglePublicSaleTx.wait();

			for( let i=1; i <= lmt; i++){
				// Get a new wallet
				wallet = ethers.Wallet.createRandom();
				// add the provider from Hardhat
				wallet =  wallet.connect(ethers.provider);
				// send ETH to the new wallet so it can perform a tx
				await addr1.sendTransaction({to: wallet.address, value: ethers.utils.parseEther("1")});
				await box.connect(wallet).mint(tokens,{  value: PUBLIC_10_TOKEN_PRICE });
					
				if(i == lmt){
					// console.log("--------------------------------------");
					// console.log("total supply", await box.totalSupply());
					// console.log("--------------------------------------");
					// console.log("Before Burn ids: ", await box.tokenIdsOfOwner(wallet.address));
					// console.log("--------------------------------------");
					// console.log("Burning of token from the last wallet -- tx here...");
					const burnTx  = await box.connect(wallet).burnBatch(5,burnArr);
					const receipt = await burnTx.wait();
					// console.log("--------------------------------------");
					console.log("        Burn Tx Gas Used: ", receipt.gasUsed);
					// console.log("--------------------------------------");
					// console.log("After Burn ids: ", await box.tokenIdsOfOwner(wallet.address));
				}
			}
		});
	});
	
});