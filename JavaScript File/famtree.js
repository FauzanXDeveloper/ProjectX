// Function to handle form submission
function submitForm(event) {
    event.preventDefault();  // Prevent the default form submission

    const formData = new FormData(document.getElementById('memberForm'));

    fetch('../Php file/add_member.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json()) // Expecting JSON response
    .then(data => {
        console.log(data);  // Log server response
        if (data.success) {
            // Close modal and reset form
            closeModal();
            document.getElementById('memberForm').reset(); // Reset form fields

            // Display the new member's card
            displayMemberCard(data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to open the modal
function openModal(gender) {
    document.getElementById('formModal').style.display = 'flex';
    // Optionally, set gender as a default value in the form if needed
    // document.getElementById('gender').value = gender;
}

// Function to close the modal
function closeModal() {
    document.getElementById('formModal').style.display = 'none';

}



// Function to show member details when clicking on the card
function viewMemberDetails(memberId) {
    fetch('get_member_details.php?id=' + memberId)
        .then(response => response.json())
        .then(data => {
            const modalContent = document.querySelector('.modal-content');
            modalContent.innerHTML = `
                <div class="modal-close" onclick="closeModal()"><i class='bx bx-x'></i></div>
                <h2>Member Details</h2>
                <img src="../uploads/${data.photo}" alt="Profile Photo" style="width: 550px; height: 300px; border-radius: 10px; object-fit: cover; margin-bottom: 10px;">
                <p>Name: ${data.name}</p>
                <p>Birth Date: ${data.birth_date}</p>
                <p>Address: ${data.address}</p>
                <p>Phone: ${data.phone}</p>
                <p>Status: ${data.status}</p>
                <p>Marital Status: ${data.marital_status}</p>
                <p>Child of: ${data.child_of}</p>
                <p>Spouse of: ${data.spouse_of}</p>
                
                <div style="margin-top: 20px;">
                    <button onclick="toggleAddOptions()">Add</button>
                    <div id="addOptions" style="display:none; margin-top: 10px;">
                        <label for="relationType">Select Relation:</label>
                        <select id="relationship" name="relationship" onchange="fetchRelatedMembers()">
                            <option value="child">Child</option>
                            <option value="sibling">Sibling</option>
                            <option value="spouse">Spouse</option>
                        </select>

                        <select id="related_member_id" name="related_member_id">
                            <!-- populated dynamically -->
                        </select>

                        <button onclick="submitAddRelation(${data.id})" style="margin-left: 10px;">Next</button>
                    </div>

                    <button onclick="openUpdateForm(${data.id})" style="margin-top: 10px;">Update</button>
                    <button onclick="deleteMember(${data.id})" style="margin-top: 10px;">Delete</button>
                </div>
            `;
            openModal();
        })
        .catch(error => console.error('Error fetching member details:', error));
}

function toggleAddOptions() {
    const options = document.getElementById('addOptions');
    options.style.display = options.style.display === 'none' ? 'block' : 'none';
}

function submitAddRelation(memberId) {
    const relationType = document.getElementById('relationship').value;
    if (!relationType) {
        alert('Please select a relation type.');
        return;
    }

    // You can now call a function that opens the appropriate form
    openAddRelationForm(memberId, relationType);
}

function fetchRelatedMembers() {
    const relationship = document.getElementById("relationship").value;
    fetch(`get_related_members.php?relationship=${relationship}`)
      .then(res => res.json())
      .then(data => {
        const select = document.getElementById("related_member_id");
        select.innerHTML = '';
        data.forEach(member => {
          const option = document.createElement("option");
          option.value = member.id;
          option.textContent = member.name;
          select.appendChild(option);
        });
      });
  }
  

// Function to handle updating member details
document.getElementById('updateMemberForm')?.addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('../Php file/update_member.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the member card with the new details
            const card = document.querySelector(`.card[data-member-id="${data.member.id}"]`);
            card.querySelector('h3').innerText = data.member.name;
            card.querySelector('p').innerText = `Gender: ${data.member.gender}, Age: ${data.member.age}`;

            // Close the modal
            closeModal();
        } else {
            alert('Error updating member');
        }
    })
    .catch(error => console.error('Error:', error));
});

// Function to delete a member
function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        fetch('../Php file/delete_member.php?id=' + memberId, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the card from the page
                    const card = document.querySelector(`.card[data-member-id="${memberId}"]`);
                    card.remove();

                    // Close the modal
                    closeModal();
                } else {
                    alert('Error deleting member');
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function openAddRelationForm(baseId, relationType) {
    fetch(`../Php file/get_member_name.php?id=${baseId}`)
        .then(res => res.json())
        .then(baseData => {
            const relatedMemberName = baseData.name; // Got the name

            const modalContent = document.querySelector('.modal-content');

            let relationSelectHTML = '';
            if (relationType === 'child' || relationType === 'sibling') {
                relationSelectHTML = `
                    <label>Select ${relationType === 'child' ? 'Parents' : 'Siblings'}:</label>
                    <select name="relation_name" id="relation_name_select">
                        <!-- Options populated dynamically from backend -->
                    </select>
                `;
            }

            modalContent.innerHTML = `
                <div class="modal-close" onclick="closeModal()"><i class='bx bx-x'></i></div>
                <h2>Add ${relationType.charAt(0).toUpperCase() + relationType.slice(1)}</h2>
                <form id="relationForm" enctype="multipart/form-data" method="POST">
                    ${relationSelectHTML}
                    <input type="text" name="name" placeholder="Full Name" required>
                    <input type="date" name="birth_date" required>
                    <input type="text" name="birth_place" placeholder="Place of Birth" required>
                    <textarea name="address" placeholder="Address"></textarea>
                    <input type="tel" name="phone" placeholder="Phone Number">
                    <select name="status">
                        <option value="alive">Alive</option>
                        <option value="deceased">Deceased</option>
                    </select>
                    <select name="marital_status">
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                    </select>
                    <input type="file" name="photo" accept="image/*">
                    <input type="hidden" name="relation_type" value="${relationType}">
                    <input type="hidden" name="related_member_name" value="${relatedMemberName}">
                    <button type="submit">Save</button>
                </form>
            `;

            if (relationType === 'child' || relationType === 'sibling') {
                fetch(`../Php file/get_relation_list.php?relation_type=${relationType}&base_id=${baseId}`)
                    .then(response => response.json())
                    .then(data => {
                        const select = document.getElementById('relation_name_select');
                        select.innerHTML = data.map(member => `
                            <option value="${member.name}">${member.name}</option>
                        `).join('');
                    });
            }

            openModal();
            document.getElementById('relationForm').addEventListener('submit', submitRelationForm);
        });
}


function submitRelationForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    fetch('../Php file/add_member_with_relationship.php', {
        method: 'POST',
        body: formData,
    }).then(response => response.text())
      .then(data => {
          alert(data);
          closeModal();
          // Optionally refresh tree or card UI
      }).catch(error => console.error(error));
}

// Fetch and display family tree
fetch('get_family_tree.php')
    .then(response => response.json())
    .then(data => {
        const familyTreeContainer = document.getElementById('family-tree');
        familyTreeContainer.innerHTML = ''; // Clear current content

        Object.keys(data).forEach(parentId => {
            const parent = data[parentId];

            // Create parent structure
            const parentDiv = document.createElement('div');
            parentDiv.classList.add('family-group');

            const parentsDiv = document.createElement('div');
            parentsDiv.classList.add('parents');

            // Parent Card
            const parentCard = document.createElement('div');
            parentCard.classList.add('member-card');
            parentCard.innerHTML = `<img src="path/to/${parent.photo}" alt="${parent.name}" /><p>${parent.name}</p>`;
            parentsDiv.appendChild(parentCard);

            // Children Div
            const childrenDiv = document.createElement('div');
            childrenDiv.classList.add('children');
            
            parent.children.forEach(child => {
                const childCard = document.createElement('div');
                childCard.classList.add('member-card');
                childCard.innerHTML = `<img src="path/to/${child.photo}" alt="${child.name}" /><p>${child.name}</p>`;
                childrenDiv.appendChild(childCard);
            });

            // Append to parent group
            parentDiv.appendChild(parentsDiv);
            parentDiv.appendChild(childrenDiv);

            familyTreeContainer.appendChild(parentDiv);
        });
    })
    .catch(error => console.error('Error fetching family tree:', error));
