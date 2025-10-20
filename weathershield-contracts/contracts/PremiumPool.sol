// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FarmerRegistry.sol";

contract PremiumPool is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public cusdToken;
    FarmerRegistry public farmerRegistry;

    mapping(address => uint256) public farmerBalances;

    event PremiumPaid(address indexed farmer, uint256 amount);

    constructor(address _cusdTokenAddress, address _farmerRegistryAddress) Ownable(msg.sender) {
        cusdToken = IERC20(_cusdTokenAddress);
        farmerRegistry = FarmerRegistry(_farmerRegistryAddress);
    }

    function payPremium(uint256 _amount) public {
        require(farmerRegistry.isFarmerRegistered(msg.sender), "Farmer not registered");
        require(_amount > 0, "Amount must be greater than 0");

        cusdToken.safeTransferFrom(msg.sender, address(this), _amount);
        farmerBalances[msg.sender] += _amount;

        emit PremiumPaid(msg.sender, _amount);
    }
}
