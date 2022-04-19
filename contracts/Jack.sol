// contracts/Jack.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Box.sol";
import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Jack is Initializable, ERC721AUpgradeable, OwnableUpgradeable{

    uint256 public constant MAX_SUPPLY = 7777;
    bool public isRevealed;
    string private baseTokenUri;
    address private box_address;

    
    function initialize() external initializer{
        __ERC721A_init("Jack","JACK");
        __Ownable_init();
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "Jack :: Cannot be called by a contract");
        _;
    }

    modifier callerIsBox() {
        require(tx.origin == box_address, "Jack :: can only be called by Box contract");
        _;
    }

    function mint(address addr,uint256 _quantity) external callerIsBox{
        Box box = Box(box_address);
        require((box.tokensBurntBy(addr)) != 0, "Jack :: you did not burn any BOX token");
        require((box.tokensBurntBy(addr)) >= (_quantity + _numberMinted(addr)), "Jack :: Burning Beyond minted quantity");
        require((totalSupply() + _quantity) <= MAX_SUPPLY, "Jack :: Beyond Max Supply");
        _safeMint(addr, _quantity);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenUri;
    }

    function setTokenUri(string memory _baseTokenUri) external onlyOwner{
        baseTokenUri = _baseTokenUri;
    }
   
    function toggleReveal() external onlyOwner{
        isRevealed = !isRevealed;
    }

    function setBoxAddress(address _box_address) external onlyOwner{
        box_address = _box_address;
    }

    function getBoxAddress() external view returns (address){
        return box_address;
    }

    function tokensMintedtBy(address owner) external view returns (uint256) {
        return _numberMinted(owner);
    }

    function withdraw() external onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
    }

    function version() external pure returns (string memory) {
        return "1.0.0";
    }
    
}