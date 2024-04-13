CREATE TABLE ourforum.`data` (
                                 id int unsigned auto_increment NOT NULL,
                                 sender varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
                                 content longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
                                 status mediumtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
                                 sonm varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
                                 `datetime` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
                                 CONSTRAINT `PRIMARY` PRIMARY KEY (id)
)
    ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci
AUTO_INCREMENT=1;
