// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FarmerRegistry.sol";

contract PayoutManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public cusdToken;
    FarmerRegistry public farmerRegistry;

    event PayoutTriggered(address indexed farmer, uint256 amount);

    constructor(address _cusdTokenAddress, address _farmerRegistryAddress) Ownable(msg.sender) {
        cusdToken = IERC20(_cusdTokenAddress);
        farmerRegistry = FarmerRegistry(_farmerRegistryAddress);
    }

    function triggerPayout(address _farmer, uint256 _amount) public onlyOwner nonReentrant {
        require(farmerRegistry.isFarmerRegistered(_farmer), "Farmer not registered");
        require(_amount > 0, "Amount must be greater than 0");

        cusdToken.safeTransfer(_farmer, _amount);

        emit PayoutTriggered(_farmer, _amount);
    }
}
