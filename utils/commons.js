const Parser= (val) => {
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      } catch {
        return [];
      }
    }
    return val;
};
module.exports={
  Parser
}