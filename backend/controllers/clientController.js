const Client = require('../models/Client');
const WorkItem = require('../models/WorkItem');

// Create a new client
const createClient = async (req, res) => {
  try {
    const { clientName, clientAddress, email, createdBy } = req.body;

    const client = await Client.create({
      clientName,
      clientAddress,
      email,
      createdBy,
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Error creating client' });
  }
};

// Get all clients or a single client by ID with associated work items
const getClients = async (req, res) => {
  const clientId = req.query.clientId;

  try {
    let clients;

    if (clientId) {
      clients = await Client.findByPk(clientId, {
        include: WorkItem,
      });
    } else {
      clients = await Client.findAll({
        include: WorkItem,
      });
    }

    if (!clients) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    res.json(clients);
  } catch (error) {
    console.error('Error retrieving clients:', error);
    res.status(500).json({ error: 'An error occurred while retrieving clients.' });
  }
};

// Update client status
const updateClientStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if the provided status value is valid
    const validStatusValues = ['approved', 'rejected']; // Update with your enum values
    if (!validStatusValues.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update the status
    client.status = status;
    await client.save();

    return res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ error: 'An error occurred while updating status' });
  }
};

const getClientData = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    

    const query = `SELECT createdAt, COUNT(*) as created, status FROM clients WHERE createdAt BETWEEN ? AND ? GROUP BY createdAt`;
    const clientData = await Client.sequelize.query(query, {
      replacements: [startDate, endDate],
      type: Client.sequelize.QueryTypes.SELECT,
    });

    res.json(clientData);
  } catch (error) {
    console.error('Error retrieving client data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving client data.' });
  }
};

module.exports = {
  createClient,
  getClients,
  updateClientStatus,
  getClientData,
};
