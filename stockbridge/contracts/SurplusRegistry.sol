// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SurplusRegistry
/// @notice Educational example: records a reference to a surplus listing.
/// @dev This does not verify physical inventory, seller identity, or payments.
contract SurplusRegistry {
    struct ListingRecord {
        address seller;
        bytes32 listingReference;
        uint256 recordedAt;
    }

    uint256 public nextRecordId = 1;
    mapping(uint256 => ListingRecord) public records;
    event ListingRecorded(uint256 indexed recordId, address indexed seller, bytes32 listingReference, uint256 recordedAt);

    function recordListing(bytes32 listingReference) external returns (uint256 recordId) {
        require(listingReference != bytes32(0), "Reference required");
        recordId = nextRecordId++;
        records[recordId] = ListingRecord(msg.sender, listingReference, block.timestamp);
        emit ListingRecorded(recordId, msg.sender, listingReference, block.timestamp);
    }

    function getListing(uint256 recordId) external view returns (address seller, bytes32 listingReference, uint256 recordedAt) {
        ListingRecord memory item = records[recordId];
        require(item.seller != address(0), "Record not found");
        return (item.seller, item.listingReference, item.recordedAt);
    }
}
