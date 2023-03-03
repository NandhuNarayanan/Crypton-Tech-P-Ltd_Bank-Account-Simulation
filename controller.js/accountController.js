const mongoose = require("mongoose");
const BackAccount = require("../model/accountModel");

exports.openAccount = async (req, res) => {
  try {
    const {
      name,
      gender,
      dob,
      email,
      mobile,
      address,
      initialBalance,
      adharNo,
      panNo,
    } = req.body;

    const account = new BackAccount({
      name,
      gender,
      dob,
      email,
      mobile,
      address,
      initialBalance,
      adharNo,
      panNo,
      balance: initialBalance,
    });

    await account.save();

    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//Update KYC details
exports.updateKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dob, email, mobile, adharNo, panNo } = req.body;

    const account = await BackAccount.findById(id);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    if(account.closed == true) return res.status(406).send("Account closed")


    account.name = name;
    account.dob = dob;
    account.email = email;
    account.mobile = mobile;
    account.adharNo = adharNo;
    account.panNo = panNo;

    await account.save();

    res.json({ account, message: "KYC Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Deposit Money

exports.depositMoney = async (req, res) => {
  const { amount } = req.body;
  try {

const user= await BackAccount.findOne({_id:req.params.accountId})

if(!user) return res.status(404).send("Account not found")

if(user.closed == true) return res.status(406).send("Payment not acceptable")


    const account = await BackAccount.findByIdAndUpdate(
      req.params.accountId,
      {
        $inc: { balance: amount },
        $push: { ledger: {type: "Deposit", amount, date: new Date() ,from:"Bank",to:user.name } },
      },
      { new: true }
    );

    res.status(200).json({ account, message: "Money deposited Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error depositing money");
  }
};

//Withdraw Money

exports.withdrawMoney = async (req, res) => {
  const { amount } = req.body;

  try {
    const user= await BackAccount.findOne({_id:req.params.accountId})

    if(!user) return res.status(404).send("Account not found")
    if(user.closed == true) return res.status(406).send("Account closed")


    const account = await BackAccount.findByIdAndUpdate(
      req.params.accountId,
      {
        $inc: { balance: -amount },
        $push: { ledger: { type: "Withdrawal", amount, date: new Date() ,from:user.name,to:"withdraw"} },
      },
      { new: true }
    );

    res.status(200).json(account);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error withdrawing money");
  }
};

// Transfer Money
exports.transferMoney = async (req, res) => {
  const { amount } = req.body;
  const { fromAccountId, toAccountId } = req.params;

  try {
    const fromAccount = await BackAccount.findById(fromAccountId);
    const toAccount = await BackAccount.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      return res.status(404).send("Account not found");
    }
    if(fromAccount.closed == true) return res.status(406).send("Account closed")
    if(toAccount.closed == true) return res.status(406).send("Account closed")



    if (fromAccount.balance < amount) {
      return res.status(400).send("Insufficient balance");
    }

    await BackAccount.bulkWrite([
      {
        updateOne: {
          filter: { _id: fromAccountId },
          update: {
            $inc: { balance: -amount },
            $push: {
              ledger: {
                type: "Transfer",
                amount: amount,
                date: new Date(),
                from:fromAccount.name,
                to: toAccount.name,
              },
            },
          },
        },
      },
      {
        updateOne: {
          filter: { _id: toAccountId },
          update: {
            $inc: { balance: amount },
            $push: {
              ledger: {
                type: "Transfer",
                amount,
                date: new Date(),
                from:toAccount.name,
                to: fromAccount.name,
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error transferring money");
  }
};

//Receive Money

exports.receiveMoney = async (req, res) => {
  const { amount, fromName } = req.body;
  const { toAccountId } = req.params;

  try {
    const toAccount = await BackAccount.findById(toAccountId);

    if (!toAccount) {
      return res.status(404).send("Account not found");
    }
    if(toAccount.closed == true) return res.status(406).send("Account closed")

    await BackAccount.updateOne(
      { _id: toAccountId },
      {
        $inc: { balance: amount },
        $push: {
          ledger: { type: "Receive", amount, date: new Date(),from:"Online" ,to:toAccount.name  },
        },
      }
    );

    res.status(200).json({ message: "Money received successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error receiving money");
  }
};

// print account details 
exports.printStatement = async (req, res) => {
  const { accountId } = req.params;

  try {
    const account = await BackAccount.findById(accountId);

    if (!account) {
      return res.status(404).send("Account not found");
    }
    if(account.closed == true) return res.status(406).send("Account closed")


    const {
      name,
      gender,
      dob,
      email,
      mobile,
      address,
      initialBalance,
      adharNo,
      panNo,
      balance,
      ledger,
    } = account;

    let statement = `Account Details:\nName: ${name}\nGender: ${gender}\nDOB: ${dob}\nEmail: ${email}\nMobile: ${mobile}\nAddress: ${address}\nInitial Balance: ${initialBalance}\nAdhar No.: ${adharNo}\nPan No.: ${panNo}\nCurrent Balance: ${balance}\n\nTransaction History:\n`;

    ledger.forEach((transaction) => {
      statement += `${transaction.type} - Amount: ${
        transaction.amount
      }, Date: ${transaction.date}, ${
        transaction.type === "Transfer" ? "To" : "From"
      }: ${
        transaction.type === "Transfer" ? transaction.to : transaction.from
      }\n`;
    });

    res.status(200).send(statement);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error printing statement");
  }
};


exports.closeAccount = async (req,res)=>{

    const { accountId } = req.params;

    try {
      const account = await BackAccount.findById(accountId);
  
      if (!account) {
        return res.status(404).send('Account not found');
      }
  
      account.closed = true; 
      await account.save(); 
  
      res.status(200).send('Account closed successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error closing account');
    }

}