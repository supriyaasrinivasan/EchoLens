-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 28, 2020 at 02:37 PM
-- Server version: 5.6.12-log
-- PHP Version: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `fertilizerassistance`
--
CREATE DATABASE IF NOT EXISTS `fertilizerassistance` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `fertilizerassistance`;

-- --------------------------------------------------------

--
-- Table structure for table `carttable`
--

CREATE TABLE IF NOT EXISTS `carttable` (
  `Sno` int(4) NOT NULL,
  `UserID` varchar(50) NOT NULL,
  `ProductID` varchar(50) NOT NULL,
  `ProductName` varchar(50) NOT NULL,
  `Price` float NOT NULL,
  `Quantity` float NOT NULL,
  `Total` float NOT NULL,
  PRIMARY KEY (`Sno`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `logintable`
--

CREATE TABLE IF NOT EXISTS `logintable` (
  `Username` varchar(50) NOT NULL,
  `Password` varchar(50) NOT NULL,
  PRIMARY KEY (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `logintable`
--

INSERT INTO `logintable` (`Username`, `Password`) VALUES
('admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `purchasetable`
--

CREATE TABLE IF NOT EXISTS `purchasetable` (
  `InvoiceNo` varchar(50) NOT NULL,
  `SupplierID` varchar(50) NOT NULL,
  `ProductID` varchar(50) NOT NULL,
  `PurchasePrice` decimal(18,2) NOT NULL,
  `Tax` float NOT NULL,
  `Quantity` decimal(18,1) NOT NULL,
  `Total` decimal(18,2) NOT NULL,
  PRIMARY KEY (`InvoiceNo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `salemaster`
--

CREATE TABLE IF NOT EXISTS `salemaster` (
  `InvoiceNo` int(11) NOT NULL,
  `UserID` varchar(50) NOT NULL,
  `UserName` varchar(50) NOT NULL,
  `InvoiceDate` date NOT NULL,
  `Quantity` int(2) NOT NULL,
  `Total` decimal(8,2) NOT NULL,
  `Status` varchar(10) NOT NULL,
  PRIMARY KEY (`InvoiceNo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `saletrans`
--

CREATE TABLE IF NOT EXISTS `saletrans` (
  `Sno` int(11) NOT NULL,
  `InvoiceNo` int(11) NOT NULL,
  `ProductID` varchar(20) NOT NULL,
  `ProductName` varchar(50) NOT NULL,
  `Price` decimal(8,2) NOT NULL,
  `Quantity` float NOT NULL,
  `Total` decimal(8,2) NOT NULL,
  PRIMARY KEY (`Sno`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `stocktable`
--

CREATE TABLE IF NOT EXISTS `stocktable` (
  `ProductID` varchar(10) NOT NULL,
  `ProductName` varchar(50) NOT NULL,
  `ForCrop` varchar(100) NOT NULL,
  `HowToUse` varchar(500) NOT NULL,
  `Benefits` varchar(200) NOT NULL,
  `Unit` varchar(20) NOT NULL,
  `PurchasePrice` decimal(18,2) NOT NULL,
  `Tax` float NOT NULL,
  `SellingPrice` decimal(18,2) NOT NULL,
  `Quantity` decimal(9,1) NOT NULL,
  `ReOrderLevel` int(11) NOT NULL,
  `Image` varchar(50) NOT NULL,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `stocktable`
--

INSERT INTO `stocktable` (`ProductID`, `ProductName`, `ForCrop`, `HowToUse`, `Benefits`, `Unit`, `PurchasePrice`, `Tax`, `SellingPrice`, `Quantity`, `ReOrderLevel`, `Image`) VALUES
('P001', 'Biogrow (All purpose organic manure, 1 kg)', 'à®ªà®¯à¯‹à®•à®¿à®°à¯‹ à®’à®°à¯ à®šà¯†à®±à®¿à®µà¯‚à®Ÿà¯à®Ÿà®ªà¯à®ªà®Ÿà¯à®Ÿ à®•à®°à®¿à®® à®‰à®°à®®', 'à®’à®°à¯ à®šà¯†à®Ÿà®¿à®•à¯à®•à¯ à®ªà®¾à®©à¯ˆà®¯à®¿à®²à¯ 100-200 à®•à®¿à®°à®¾à®®à¯, à®’à®°à¯ à®šà®¤à¯à®° à®®à¯€à®Ÿà¯à®Ÿà®°à¯à®•à¯à®•à¯ 2-3 à®•à®¿à®²à¯‹, à®’à®°à¯ à®®à®¾à®¤à®¤à¯à®¤à®¿à®±à¯à®•à¯ à®’à®°à¯ à®®à¯à®±à¯ˆ', 'à®•à®°à®¿à®® à®¤à¯‹à®±à¯à®±à®®à¯, à®…à®©à¯ˆà®¤à¯à®¤à¯ à®µà®•à¯ˆà®¯à®¾à®© à®¤à®¾à®µà®°à®™à¯à®•à®³à¯à®•à¯à®•à¯à®®à¯, à®®à®£à¯à®£à®¿à®©à¯ à®¤à®°à®¤à¯à®¤à¯ˆ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤ à®‰à', 'kg', '50.00', 12, '60.00', '0.0', 5, 'P001.jpg'),
('P002', 'Natural Dried Moss ( 0.5 kg )', 'à®ªà¯‚à®šà¯à®šà®Ÿà¯à®Ÿà®¿, à®¨à¯†à®²à¯, à®•à¯‹à®¤à¯à®®à¯ˆ', 'à®ªà®¿à®³à®¾à®¸à¯à®Ÿà®¿à®•à¯ à®¤à®¾à®³à¯ à®…à®²à¯à®²à®¤à¯ à®µà®¾à®³à®¿à®¯à®¿à®²à¯ à®¤à®Ÿà¯à®ªà¯à®ªà¯ˆ à®µà¯ˆà®•à¯à®•à®µà¯à®®à¯. à®¤à¯Šà®•à¯à®¤à®¿ à®¤à®£à¯à®£à¯€à®°à¯ˆ à®‰à®±à®¿à®žà¯à®šà¯à®®à¯ à®µà®°à¯ˆ à®ªà®Ÿà®¿à®ªà¯à®ªà®Ÿà®¿à®¯à®¾à®• à®¨à¯€à®°à¯. à®Žà®³à®¿à®¤à®¿à®²à¯ à®¨à¯€à®°à¯ à®‰à®±à®¿à®žà¯à®šà®ªà¯à®ªà®Ÿà¯à®µà®¤à®±à¯à®•à¯ à®¤à®Ÿà¯à®ªà¯à®ªà¯ˆà®¤à¯ à®¤à®Ÿà¯à®Ÿà®µà¯à®®à¯. à®šà®¿à®² à®®à®£à®¿à®¨à¯‡à®°à®™à¯à®•à®³à¯à®•à¯à®•à¯à®ªà¯ à®ªà®¿à®±à®•à¯, à®’à®°à¯ à®®à', 'à®‡à®¤à¯ à®®à®£à¯à®£à®±à¯à®± à®ªà¯‚à®šà¯à®šà®Ÿà¯à®Ÿà®¿ à®•à®²à®µà¯ˆ. à®¤à¯Šà®•à¯à®¤à®¿ à®ªà®Ÿà®¿à®µà®¤à¯à®¤à¯ˆ à®•à¯Šà®£à¯à®Ÿà¯ à®šà¯†à®²à¯à®² à®Žà®³à®¿à®¤à®¾à®©à®¤à¯. à®‡à®¤à¯ à®‡à®²à®•à¯', 'kg', '60.00', 12, '80.00', '0.0', 1, 'P002.jpg'),
('P003', 'Neem Cake - 1 kg', 'à®®à®£à¯à®£à®¿à®²à¯ à®‰à®³à¯à®³ à®ªà¯‚à®šà¯à®šà®¿à®•à®³à¯ˆ à®…à®•à®±à¯à®±à¯à®®à¯ ', 'à®šà¯†à®Ÿà®¿à®¯à¯ˆà®šà¯ à®šà¯à®±à¯à®±à®¿à®¯à¯à®³à¯à®³ à®®à®£à¯à®£à®¿à®²à¯ à®¤à®Ÿà®µà®µà¯à®®à¯, à®†à®©à®¾à®²à¯ à®ªà®¿à®°à®¤à®¾à®© à®¤à®£à¯à®Ÿà¯à®•à¯à®•à¯ à®µà¯†à®³à®¿à®¯à¯‡.', 'à®µà¯‡à®ªà¯à®ª à®µà®¿à®¤à¯ˆ à®•à¯‡à®•à¯ à®’à®°à¯ à®®à®£à¯ à®¤à®¿à®°à¯à®¤à¯à®¤à®®à®¾à®• à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯, à®‡à®¤à¯ à®®à®£à¯à®£à¯ˆ à®µà®³à®®à®¾à®•à¯à', 'kg', '300.00', 0, '320.00', '0.0', 1, 'P003.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `suppliertable`
--

CREATE TABLE IF NOT EXISTS `suppliertable` (
  `SupplierID` varchar(50) NOT NULL,
  `SupplierName` varchar(50) NOT NULL,
  `CompanyName` varchar(50) NOT NULL,
  `Address` varchar(500) NOT NULL,
  `ContactNo` varchar(15) NOT NULL,
  `EmailID` varchar(50) NOT NULL,
  PRIMARY KEY (`SupplierID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `suppliertable`
--

INSERT INTO `suppliertable` (`SupplierID`, `SupplierName`, `CompanyName`, `Address`, `ContactNo`, `EmailID`) VALUES
('S001', 'Sundaram', 'Sakthi Fertilizers Corporation', '10/10 C, Venkatasamy Street, Railway Colony, Kavundampalayam, Coimbatore, Tamil Nadu', '0422 244 3060', ''),
('S002', 'Manohar', 'KTC Biotechnology Fertilizers', '263/4A, Shiva Complex, Mettupalayam Road, Near Saibaba Kovil Signal, Sai Baba Kovil, Coimbatore, Tamil Nadu 641043', '0422 244 3727', '');

-- --------------------------------------------------------

--
-- Table structure for table `usertable`
--

CREATE TABLE IF NOT EXISTS `usertable` (
  `UserID` varchar(10) NOT NULL,
  `UserName` varchar(50) NOT NULL,
  `Address` varchar(500) NOT NULL,
  `ContactNo` varchar(10) NOT NULL,
  `EmailID` varchar(50) NOT NULL,
  `Password` varchar(20) NOT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `usertable`
--

INSERT INTO `usertable` (`UserID`, `UserName`, `Address`, `ContactNo`, `EmailID`, `Password`) VALUES
('U001', 'Ram', 'Chennai', '9856325147', 'mail@gmail.com', 'password'),
('U002', 'Gopal', 'No 34, Viruthunagar, Salem', '8745123658', 'gopal12@gmail.com', 'password');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
