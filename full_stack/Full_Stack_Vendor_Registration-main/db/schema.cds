namespace my.supplier;

using {cuid} from '@sap/cds/common';

entity users {
    firstname : String(200);
    lastname  : String(200);
    email: String(200);
    key username: String(200);
    password: String(200);
}

entity Otps {
    key email   : String @(format: 'email');
    code        : String(6);
    expiresAt   : Timestamp;
}
entity Supplier : cuid {
    key supplierName      : String(200) @cds.persistence.unique;
        status            : String(100);
        aiExtractedText   : LargeString;
        businessPartnerId : String;
        mainAddress       : Association to Address;
        primaryContact    : Association to Contact;
        categoryAndRegion : Association to CategoryRegion;
        additionalInfo    : Association to AdditionalInfo;
        attachments       : Association to many Attachment
                                on attachments.supplier = $self;
}

entity gst : cuid {
    key supplierName : String(200);
    key field        : String(10);
        status       : String;
        remarks      : String;
}

entity Address : cuid {
    street     : String(200);
    line2      : String(200);
    line3      : String(200);
    city       : String(100);
    postalCode : String(20);
    country    : String(100);
    region     : String(100);
}

entity Contact : cuid {
    firstName : String(100);
    lastName  : String(100);
    email     : String(200);
    phone     : String(50);
}

entity CategoryRegion : cuid {
    category : String(100);
    region   : String(100);
}

entity AdditionalInfo : cuid {
    details : String(100);
}

entity Attachment : cuid {
    supplier     : Association to Supplier;

    supplierName : String;
    fileName     : String(255);
    mimeType     : String(100);
    filesize     : String(100);
    content      : LargeString;
    uploadedAt   : Timestamp;
}

entity Approver : cuid {
    name    : String(100);
    email   : String(200);
    country : String(50);
    level   : String;
}

entity ApproverComment : cuid {
    approver  : Association to Approver;
    supplier  : Association to Supplier
                    on supplier.supplierName = sup_name;
    sup_name  : String(100);
    level     : String;
    name      : String(100);
    email     : String(200);
    status    : String(30);
    comment   : String(1000);
    createdAt : Timestamp;
    updatedAt : Timestamp;
}
