// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal interface for ERC20 tokens (only the method we use)
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract TokenTransfer {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    // Function to transfer tokens from the contract to a recipient
    function transferToken(address tokenAddress, address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid recipient address");
        IERC20 token = IERC20(tokenAddress);
        bool success = token.transfer(recipient, amount);
        require(success, "Token transfer failed");
    }

    // Withdraw accidentally sent ETH
    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Accept ETH
    receive() external payable {}
}
