// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataOwnership {

    struct Data {
        string dataHash;
        address owner;
    }

    mapping(uint => Data) public dataStore;
    uint public dataCount;

    function storeData(string memory _hash) public {
        dataCount++;
        dataStore[dataCount] = Data(_hash, msg.sender);
    }

    function getData(uint _id) public view returns (string memory, address) {
        Data memory d = dataStore[_id];
        return (d.dataHash, d.owner);
    }
}