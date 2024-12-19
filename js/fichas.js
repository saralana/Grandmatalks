    function ficha(cor) {
        document.getElementById("ficha").style.backgroundColor = cor;
    }
        
    function creme() {
        document.getElementById("ficha").style.backgroundColor = "var(--creme)";
        document.getElementById("mySidebar").style.width = "350px";
        document.getElementById("mySidebar").style.backgroundColor = "var(--creme)";
        document.getElementById("mySidebar").style.color = "var(--verde)";
        document.getElementById("closebtn").style.color = "var(--verde)";
    }
    
    function openNav() {
        document.getElementById("mySidebar").style.width = "350px";
    }
    
    function closeNav() {
        document.getElementById("mySidebar").style.width = "0";
    }
