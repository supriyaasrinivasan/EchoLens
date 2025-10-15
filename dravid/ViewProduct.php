<html>
<head>
<link rel="stylesheet" type="text/css" href="Style.css"></link>
</head>

<body id="bdy">
    
    <?php
	session_start();
	//$con = mysqli_connect("localhost","root","","fertilizerassistance");
	//mysqli_select_db($con,"fertilizerassistance");
	//echo $con;
        include('HeaderUser.php');
	include_once('Db.php');
	
    ?>



	
        <div style="text-align:center; width:40%; padding: 40px;">
        
	<center>	
	    <form action="" method="post">
		<table style="text-align:left; width:100%;">
		<tr>
		<td>
		Select Crop
		
		</td>
		<td>
		<select name='cboCrop'>
		
		
		<?php
		  $query = mysqli_query($con,"Select ForCrop,Quantity From StockTable Group By ForCrop");

           
            While($r = mysqli_fetch_assoc($query))
            {
				
				echo "<option value='" . $r['ForCrop']  . "'>" . $r['ForCrop'] . "</option>";
			}
			?>
		</select>
		</td>
		</tr>
		<tr>
		<td colspan='2' align='center'>
		<input type='submit' name='submit' value='Show' />
		</td>
		</table>
</form>
		</center>
		    <form action="ViewproductDescription.php" method="post">
        <table style="text-align:left; width:100%;">

            <?php

			if(isset($_POST['submit']))
			{
				$forcrop = $_REQUEST['cboCrop'];
				$query = mysqli_query($con,"Select * From StockTable Where ForCrop ='" . $forcrop . "' ");
				//echo "<br/><br/><br/><br/><br/><br/>" . $query;
				//return;
			}
			else
				
				{
            $query = mysqli_query($con,"Select * From StockTable");
				}
           
            While($r = mysqli_fetch_assoc($query))
            {
                
				$qty= $r['Quantity'];
				if($qty==0)
				{
					echo "<tr><td>";
                echo $r['ProductName'];
                echo "<br><br> <img src = 'Image/Product/". $r['Image'] . "' Height='150px' Width='200px' /></td>";
                echo "<td><p><b>Crop: </b>" . $r['ForCrop'] . "</p>";
                echo "<p><b>How to Use: </b>" . $r['HowToUse'] . "</p>";
                echo "<p><b>Uses: </b>" . $r['Benefits'] . "</p>";
			//	echo "<p><b>Diseases: </b>" . $r['DiseaseInformation'] . "</p>";
				echo "<p style='color:red'>No Stock</b>";
              //  echo "<input type='submit' name='" . $r['ProductID'] . "' value='Add >>' class='btn_submit'/><br></td>";
			  

                echo "</td></tr>";
				}
				else
				{
                echo "<tr><td>";
                echo $r['ProductName'];
                echo "<br><br> <img src = 'Image/Product/". $r['Image'] . "' Height='150px' Width='200px' /></td>";
                echo "<td><p><b>Crop: </b>" . $r['ForCrop'] . "</p>";
                echo "<p><b>How to Use: </b>" . $r['HowToUse'] . "</p>";
                echo "<p><b>Uses: </b>" . $r['Benefits'] . "</p>";
				//echo "<p><b>Diseases: </b>" . $r['DiseaseInformation'] . "</p>";
                echo "<input type='submit' name='" . $r['ProductID'] . "' value='Add >>' class='btn_submit'/><br></td>";

                echo "</td></tr>";
				}
            }

            mysqli_close($con);

            ?>

        </table>

        </div>  

    </form>
   
</body>
</html>