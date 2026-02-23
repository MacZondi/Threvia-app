// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ThreviaToken
 * @dev ERC-20 Token for Threvia Intelligence Engine
 * Represents Threvia Bucks - earned through health engagement and can be used to purchase data packages
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract ThreviaToken is IERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    string public constant name = "Threvia Bucks";
    string public constant symbol = "THREV";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    address public owner;
    mapping(address => bool) public minters;
    
    // Events
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier onlyMinter() {
        require(minters[msg.sender], "Only minters can call this");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        minters[msg.sender] = true;
    }
    
    /**
     * @dev Mint new tokens (only minters can call)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Minted(to, amount);
        emit Transfer(address(0), to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        
        emit Burned(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }
    
    /**
     * @dev Transfer tokens
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Approve spender to spend tokens
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens on behalf of owner
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        require(to != address(0), "Cannot transfer to zero address");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Add a minter (only owner)
     */
    function addMinter(address minter) external onlyOwner {
        require(!minters[minter], "Already a minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter (only owner)
     */
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner address");
        owner = newOwner;
    }
}
