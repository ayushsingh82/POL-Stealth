// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.28;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// /**
//  * @title StealthTransfer
//  * @dev Contract for handling stealth transfers on Horizen network
//  */
// contract StealthTransfer is ReentrancyGuard, Ownable {
    
//     // Events
//     event TransferCompleted(
//         address indexed from,
//         address indexed to,
//         uint256 amount,
//         bytes32 indexed stealthHash
//     );
    
//     event TransferFailed(
//         address indexed from,
//         address indexed to,
//         uint256 amount,
//         string reason
//     );

//     // Structs
//     struct TransferRequest {
//         address recipient;
//         uint256 amount;
//         bytes32 stealthHash;
//         bool completed;
//         uint256 timestamp;
//     }

//     // State variables
//     mapping(address => TransferRequest[]) public userTransfers;
//     mapping(bytes32 => bool) public stealthHashes;
//     uint256 public totalTransfers;
//     uint256 public totalVolume;

//     // Modifiers
//     modifier validAddress(address _address) {
//         require(_address != address(0), "Invalid address");
//         _;
//     }

//     modifier validAmount(uint256 _amount) {
//         require(_amount > 0, "Amount must be greater than 0");
//         _;
//     }

//     /**
//      * @dev Transfer ETH to a recipient with stealth address support
//      * @param recipient The address to send ETH to
//      * @param amount The amount of ETH to send
//      * @param stealthHash Optional stealth hash for privacy
//      */
//     function transferETH(
//         address payable recipient,
//         uint256 amount,
//         bytes32 stealthHash
//     ) external payable nonReentrant validAddress(recipient) validAmount(amount) {
//         require(msg.value >= amount, "Insufficient ETH sent");
//         require(address(this).balance >= amount, "Contract has insufficient balance");

//         // Create transfer request
//         TransferRequest memory request = TransferRequest({
//             recipient: recipient,
//             amount: amount,
//             stealthHash: stealthHash,
//             completed: false,
//             timestamp: block.timestamp
//         });

//         // Store transfer request
//         userTransfers[msg.sender].push(request);
        
//         // Mark stealth hash as used if provided
//         if (stealthHash != bytes32(0)) {
//             require(!stealthHashes[stealthHash], "Stealth hash already used");
//             stealthHashes[stealthHash] = true;
//         }

//         // Perform the transfer
//         (bool success, ) = recipient.call{value: amount}("");
        
//         if (success) {
//             // Update state
//             userTransfers[msg.sender][userTransfers[msg.sender].length - 1].completed = true;
//             totalTransfers++;
//             totalVolume += amount;
            
//             // Emit success event
//             emit TransferCompleted(msg.sender, recipient, amount, stealthHash);
            
//             // Refund excess ETH if any
//             uint256 excess = msg.value - amount;
//             if (excess > 0) {
//                 (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
//                 require(refundSuccess, "Failed to refund excess ETH");
//             }
//         } else {
//             // Emit failure event
//             emit TransferFailed(msg.sender, recipient, amount, "Transfer failed");
//             revert("Transfer failed");
//         }
//     }

//     /**
//      * @dev Get transfer history for a user
//      * @param user The address to get transfers for
//      * @return Array of transfer requests
//      */
//     function getUserTransfers(address user) external view returns (TransferRequest[] memory) {
//         return userTransfers[user];
//     }

//     /**
//      * @dev Get transfer count for a user
//      * @param user The address to get count for
//      * @return Number of transfers
//      */
//     function getUserTransferCount(address user) external view returns (uint256) {
//         return userTransfers[user].length;
//     }

//     /**
//      * @dev Check if a stealth hash has been used
//      * @param stealthHash The hash to check
//      * @return True if hash has been used
//      */
//     function isStealthHashUsed(bytes32 stealthHash) external view returns (bool) {
//         return stealthHashes[stealthHash];
//     }

//     /**
//      * @dev Get contract statistics
//      * @return _totalTransfers Total number of transfers
//      * @return _totalVolume Total volume transferred
//      * @return _contractBalance Current contract balance
//      */
//     function getContractStats() external view returns (
//         uint256 _totalTransfers,
//         uint256 _totalVolume,
//         uint256 _contractBalance
//     ) {
//         return (totalTransfers, totalVolume, address(this).balance);
//     }

//     /**
//      * @dev Emergency function to withdraw all ETH (only owner)
//      */
//     function emergencyWithdraw() external onlyOwner {
//         uint256 balance = address(this).balance;
//         require(balance > 0, "No ETH to withdraw");
        
//         (bool success, ) = payable(owner()).call{value: balance}("");
//         require(success, "Emergency withdrawal failed");
//     }

//     /**
//      * @dev Allow the contract to receive ETH
//      */
//     receive() external payable {}
// } 