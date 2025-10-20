// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FarmerRegistry is Ownable {
    constructor() Ownable(msg.sender) {}
    struct Farmer {
        address wallet;
        string latitude;
        string longitude;
        string cropType;
    }

    mapping(address => Farmer) public farmers;
    mapping(address => bool) public isFarmerRegistered;

    event FarmerRegistered(address indexed farmer, string latitude, string longitude, string cropType);

    modifier onlyRegisteredFarmer() {
        require(isFarmerRegistered[msg.sender], "Farmer not registered");
        _;
    }

    function registerFarmer(string memory _latitude, string memory _longitude, string memory _cropType) public {
        require(!isFarmerRegistered[msg.sender], "Farmer already registered");

        farmers[msg.sender] = Farmer(msg.sender, _latitude, _longitude, _cropType);
        isFarmerRegistered[msg.sender] = true;

        emit FarmerRegistered(msg.sender, _latitude, _longitude, _cropType);
    }

    function updateFarmer(string memory _latitude, string memory _longitude, string memory _cropType) public onlyRegisteredFarmer {
        farmers[msg.sender] = Farmer(msg.sender, _latitude, _longitude, _cropType);
        emit FarmerRegistered(msg.sender, _latitude, _longitude, _cropType);
    }
}
