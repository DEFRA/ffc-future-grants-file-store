module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ffc_future_grants_file_store', {
    file_data_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    file_id: { type: DataTypes.STRING },
    file_name: { type: DataTypes.STRING },
    file_size: { type: DataTypes.STRING },
    file_type: { type: DataTypes.STRING },
    file_extension: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    user_ID: { type: DataTypes.INTEGER },
    business_ID: { type: DataTypes.INTEGER },
    case_ID: { type: DataTypes.INTEGER },
    grant_scheme: { type: DataTypes.STRING },
    grant_sub_scheme: { type: DataTypes.STRING },
    grant_theme: { type: DataTypes.STRING },
    date_time: { type: DataTypes.DATE },
    storage_url: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
    created_by: { type: DataTypes.STRING },
    updated_by: { type: DataTypes.STRING }
  }, {
    freezeTableName: true,
    tableName: 'ffc_future_grants_file_store'
  })
}