<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
	
    <?php
	session_start();
   include('HeaderUser.php');

    ?>

    <form action="AddToCart.php" method="post">
    <div style="text-align:left; margin-top:20px;">
        <?php
            include_once('Db.php');

            $Id = "";
            foreach($_POST as $name => $content){
            $Id = $name;
            }


            //$Id = array_keys($_POST)[0];

            $query = mysqli_query($con,"Select * From StockTable Where ProductId = '". $Id ."' ");
            if($r = mysqli_fetch_assoc($query))
            {


                echo "<table style='text-align:left;' cellspacing='50px'><tr><td Width='350px'>";
                echo "<h3>" . $r['ProductName']. "</h3>";
                echo "<br><br> <img src = 'Image/Product/". $r['Image'] . "' Height='250px' Width='300px' /></td>";
                echo "<td><p><strong>Selling Price:</strong> " . $r['SellingPrice'] . "</p>";
                echo "<p><strong>Unit:</strong> " . $r['Unit'] . "</p>";
                echo "<p>" . $r['Benefits'] . "</p>";
                
                echo "<p>Quantity: <input type='text' name='txtQuantity' style='Height:40px; Width:60px;' /></p>";
				
                echo "<input type='submit' name='" . $Id . "' value='Add to Cart' class='btn_submit'/><br><br></td>";
                echo "</tr></table>";
            }
            mysqli_close($con);
        ?>
    </div>	
    </form>
	
</body>

</html>