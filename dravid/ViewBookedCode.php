<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">

<?php
session_start();
    include('HeaderAdmin.php');
    include_once('Db.php');

    $Id = "";
    foreach($_POST as $name => $content){
    $Id = $name;
    }

    $SplitedName = explode('-', $Id);
                    
    if($SplitedName[0] == "@")
    {

    ?>

        <table class="mygrid" align="center">
        
        <tr><td colspan="10">BOOKED ITEM DETAILS<br><br><td><tr>
        <tr><th>InvoiceNo</th><th>ProductID</th><th>ProductName</th><th>Price</th><th>Quantity</th><th>Total</th></tr>
        
        <?php
            
        $query = mysqli_query($con,"Select * From SaleTrans Where InvoiceNo = '". $SplitedName[1] ."' ");
        while($r = mysqli_fetch_assoc($query))
        {
            echo "<tr><td>" . $r['InvoiceNo'] . "</td><td>" . $r['ProductID'] . "</td><td>" . $r['ProductName'] . "</td><td>" . $r['Price'] . "</td><td>" . $r['Quantity'] . "</td><td>" . $r['Total'] ."</td></tr>";
        }   
        mysqli_close($con);
            
        ?>
        
    </table>

    <?php
       
    }
    else 
    {

        $query = mysqli_query($con,"Select * From SaleTrans Where InvoiceNo = '". $Id ."' ");
        while($r = mysqli_fetch_assoc($query))
        {
            $subquery = "Update StockTable Set Quantity = Quantity - '". $r['Quantity'] ."' Where ProductID = '". $r['ProductID'] ."' ";
            mysqli_query($con,$subquery) or die(mysqli_error());
        }

        $query = "Update SaleMaster Set Status = 'DELIVERED' Where InvoiceNo = '". $Id ."' ";
        mysqli_query($con,$query) or die(mysqli_error());

        header('location:ViewBooked.php');

    }

?>

</body>
</html>