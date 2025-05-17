<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family Tree with JointJS</title>

    <!-- Include JointJS CSS -->
    <link href="https://cdn.jsdelivr.net/npm/jointjs/dist/joint.min.css" rel="stylesheet">

    <!-- Include JointJS JS -->
    <script src="https://cdn.jsdelivr.net/npm/jointjs/dist/joint.min.js"></script>
    
    <!-- jQuery for DOM manipulation -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #2c2c2c; /* Dark background */
        }

        #paper {
            width: 100%;
            height: 100vh;
            background-color: #1e1e1e; /* Dark background color */
            border: 1px solid #444;
            overflow: auto;
        }

        .node {
            color: white;
            font-size: 14px;
        }

        .status {
            font-weight: bold;
            color: #6fbf73; /* Green for alive */
        }

        .status.dead {
            color: #ff4d4d; /* Red for dead */
        }

        .card img {
            border-radius: 50%;
            width: 100px;
            height: 100px;
        }

        /* Popup Form Styles */
        .popup {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            z-index: 100;
        }

        .popup input, .popup textarea {
            width: 100%;
            margin: 5px 0;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #ccc;
        }

        .popup button {
            background-color: #3498db;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .popup button:hover {
            background-color: #2980b9;
        }

        .popup .close {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
        }
    </style>
</head>
<body>

<div id="paper"></div>

<!-- Popup Form -->
<div class="popup" id="popupForm">
    <span class="close" onclick="closeForm()">×</span>
    <h3>Edit Family Member</h3>
    <form id="popupFormContent">
        <input type="text" id="name" placeholder="Name">
        <input type="date" id="birthdate" placeholder="Birthdate">
        <input type="email" id="email" placeholder="Email">
        <textarea id="address" placeholder="Address"></textarea>
        <input type="text" id="phone" placeholder="Phone Number">
        <select id="status">
            <option value="Alive">Alive</option>
            <option value="Dead">Dead</option>
        </select>
        <select id="maritalStatus">
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
        </select>
        <textarea id="description" placeholder="Description"></textarea>
        <input type="file" id="image" placeholder="Image">
        <button type="submit">Save</button>
    </form>
</div>

<script>
    // Fetch JSON data (family tree) from the file
    $.getJSON('data-staljin.json', function(data) {
        // Initialize a new graph
        var graph = new joint.dia.Graph();

        // Create a paper (view) to render the graph
        var paper = new joint.dia.Paper({
            el: $('#paper'),
            model: graph,
            width: 2000,
            height: 1000,
            gridSize: 1,
            interactive: { linkMove: false },
            panning: true, 
            scaling: true, 
            background: { color: '#1e1e1e' } 
        });

        // Tree layout (hierarchical layout) settings
        var layout = new joint.layout.TreeLayout({
            graph: graph,
            root: null,
            orientation: 'TB', // Top to Bottom
            nodeSep: 50,
            levelSep: 80,
            width: 150, // Node width
            height: 100 // Node height
        });

        // Function to create nodes dynamically from JSON data
        function createNode(member, x, y) {
            var node = new joint.shapes.standard.Rectangle();
            node.position(x, y);
            node.resize(120, 100);
            node.attr({
                body: {
                    fill: '#3498db',
                    rx: 10,
                    ry: 10
                },
                label: { 
                    text: member.name + " (" + member.role + ")",
                    fill: 'white'
                },
                description: { 
                    text: "Age: " + member.age + "\n" + member.status,
                    fill: 'white'
                }
            });
            node.addTo(graph);
            return node;
        }

        // Create nodes from family data
        var nodes = {}; 

        data.members.forEach((member, index) => {
            let xPos = 100 + index * 300;
            let yPos = 100 + Math.floor(index / 2) * 150;

            let node = createNode(member, xPos, yPos);
            nodes[member.id] = node;

            // Add status
            var status = new joint.shapes.standard.TextBlock();
            status.position(xPos + 10, yPos + 60);
            status.resize(100, 30);
            status.attr({
                label: { text: member.status, fill: member.status === "Alive" ? "#6fbf73" : "#ff4d4d" }
            });
            status.addTo(graph);

            // Create links (connections) between family members (parent-child)
            member.children.forEach(childId => {
                if (nodes[childId]) {
                    var link = new joint.shapes.standard.Link();
                    link.source(node);
                    link.target(nodes[childId]);
                    link.addTo(graph);
                }
            });

            // Add click event to nodes to open the popup form
            node.on('click', function() {
                openForm(member);
            });
        });

        // Function to open the form with member data
        function openForm(member) {
            $('#name').val(member.name);
            $('#birthdate').val(member.birthdate);
            $('#email').val(member.email);
            $('#address').val(member.address);
            $('#phone').val(member.phone);
            $('#status').val(member.status);
            $('#maritalStatus').val(member.marital_status);
            $('#description').val(member.description);
            $('#popupForm').show();
        }

        // Function to close the popup form
        function closeForm() {
            $('#popupForm').hide();
        }

        // Handle zooming in/out using mouse scroll
        paper.on('wheel', function(event) {
            var scale = paper.scale().sx + (event.originalEvent.deltaY > 0 ? -0.1 : 0.1);
            scale = Math.min(Math.max(scale, 0.3), 2); // Set zoom limits (0.3x to 2x)
            paper.scale(scale, scale);
        });

        // Tree Layout Update
        layout.layout();
    });
</script>

</body>
</html>
 